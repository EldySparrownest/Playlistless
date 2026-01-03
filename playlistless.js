browser.contextMenus.create({
  id: "open-no-playlist-same",
  title: "Open without playlist (same tab)",
  contexts: ["link"],
  visible: false
});

browser.contextMenus.create({
  id: "open-no-playlist-new",
  title: "Open without playlist (new tab)",
  contexts: ["link"],
  visible: false
});

browser.menus.onShown.addListener((info, tab) => {
  //console.log(info);
  const linkUrl = info.linkUrl || "";
  let isYouTubeList = false;
  //console.log(linkUrl);

  try {
    const url = new URL(linkUrl);
    if (url.hostname.includes("youtube.com")
      && !url.pathname.includes("redirect")
      && !url.pathname.includes("playlist")
      && url.searchParams.has("list")) {
      isYouTubeList = true;
    }
  } catch (e) {
    // not a valid URL — skipping
  }

  browser.menus.update("open-no-playlist-same", {
    visible: isYouTubeList
  });
  browser.menus.update("open-no-playlist-new", {
    visible: isYouTubeList
  });

  // applying the changes
  browser.menus.refresh();
});

// strips YouTube playlist parameters
function stripPlaylistParams(urlString) {
  try {
    let url = new URL(urlString);
    // if url leads to a YouTube video with a playlist parameter
    if (
        url.hostname.includes("youtube.com")
        && url.searchParams.has("list")
    ) {
        url.searchParams.delete("list");
        if (url.searchParams.has("index")) {
            url.searchParams.delete("index");
        }
        return url.toString();
    }
  } catch (e) {
    console.error("Invalid URL:", e);
  }
  return null;
}

// respond to clicks on context menu items
browser.contextMenus.onClicked.addListener((info, tab) => {
  const cleaned = stripPlaylistParams(info.linkUrl);
  if (!cleaned) {
    // not a playlist link; do nothing
    return;
  }

  console.log("Playlistless changed url from: " + info.linkUrl + " to " + cleaned);

  if (info.menuItemId === "open-no-playlist-same") {
    // replace current tab with the cleaned URL
    browser.tabs.update(tab.id, { url: cleaned });
  } else if (info.menuItemId === "open-no-playlist-new") {
    // open the cleaned URL in a new tab
    browser.tabs.create({ url: cleaned });
  }
});
