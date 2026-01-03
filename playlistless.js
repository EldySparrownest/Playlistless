browser.contextMenus.create({
  id: "open-no-playlist-same",
  title: "Open without playlist (same tab)",
  contexts: ["link"]
});

browser.contextMenus.create({
  id: "open-no-playlist-new",
  title: "Open without playlist (new tab)",
  contexts: ["link"]
});

// strips YouTube playlist parameters
function stripPlaylistParams(urlString) {
  try {
    //console.log(urlString);
    let url = new URL(urlString);
/*     url.searchParams.forEach((val, key, parent) => {
        console.log(val);
        console.log(key);
        console.table(parent);
    }); */
    // if link leads to a YouTube video with a playlist parameter
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
    //console.log("I am in onClicked");
    //console.log(info.linkUrl);
  const cleaned = stripPlaylistParams(info.linkUrl);
    //console.log(cleaned);
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
