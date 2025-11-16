export function saveHistory(history, historyIndex, nodes, edges) {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes, edges });
  
    return {
      history: newHistory,
      index: newHistory.length - 1,
    };
  }
  
  export function undo(history, historyIndex) {
    if (historyIndex > 0) {
      return {
        state: history[historyIndex - 1],
        index: historyIndex - 1,
      };
    }
    return null;
  }
  
  export function redo(history, historyIndex) {
    if (historyIndex < history.length - 1) {
      return {
        state: history[historyIndex + 1],
        index: historyIndex + 1,
      };
    }
    return null;
  }
  