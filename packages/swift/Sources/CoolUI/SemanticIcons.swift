import Foundation

public enum CoolSemanticIcons {
  private static let symbols = [
    "add": "plus", "close": "xmark", "search": "magnifyingglass", "back": "chevron.backward",
    "forward": "chevron.forward", "check": "checkmark", "warning": "exclamationmark.triangle",
    "error": "xmark.octagon", "info": "info.circle", "calendar": "calendar", "clock": "clock",
    "menu": "line.3.horizontal", "more": "ellipsis", "share": "square.and.arrow.up",
    "settings": "gearshape", "favorite": "heart", "delete": "trash", "edit": "pencil",
  ]

  public static func sfSymbol(for semanticName: String) -> String {
    symbols[semanticName] ?? semanticName
  }
}
