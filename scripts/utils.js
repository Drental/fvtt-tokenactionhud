export function switchCSS(settingValue) {
    const styles = [
      { setting: "compact", file: "tah-compact" },
      { setting: "foundryVTT", file: "token-action-hud" },
      { setting: "dorakoUI", file: "tah-dorako" }
    ];
    
    for (const style of styles) {
      const href = ["modules/token-action-hud/",`styles/${style.file}`]
      if (style.setting === settingValue) {
        Object.values(document.styleSheets).find(ss => ss.href?.includes(href[0]) && ss.href?.includes(href[1])).disabled = false;
      } else {
        Object.values(document.styleSheets).find(ss => ss.href?.includes(href[0]) && ss.href?.includes(href[1])).disabled = true;
      }
    }
  }