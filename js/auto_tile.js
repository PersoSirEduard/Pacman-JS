function getAutoTileValue(surrounding, tileClass) {
  switch (tileClass) {
    case "wall": // Wall tile family
        if (areEqualArray(surrounding, ["0", "#", "0",
                                        "0", "#", "0",
                                        "0", "#", "0"]))
            return "1";

        if (areEqualArray(surrounding, ["0", "0", "0",
                                        "#", "#", "#",
                                        "0", "0", "0"]))
            return "2";

        if (areEqualArray(surrounding, ["0", "0", "0",
                                        "#", "#", "0",
                                        "0", "#", "0"]))
            return "3";

        if (areEqualArray(surrounding, ["0", "0", "0",
                                        "0", "#", "#",
                                        "0", "#", "0"]))
            return "4";

        if (areEqualArray(surrounding, ["0", "#", "0",
                                        "0", "#", "#",
                                        "0", "0", "0"]))
            return "5";

        if (areEqualArray(surrounding, ["0", "#", "0",
                                        "#", "#", "0",
                                        "0", "0", "0"]))
            return "6";

        if (areEqualArray(surrounding, ["0", "#", "0",
                                        "#", "#", "#",
                                        "0", "0", "0"]))
            return "7";

        if (areEqualArray(surrounding, ["0", "0", "0",
                                        "#", "#", "#",
                                        "0", "#", "0"]))
            return "8";

        if (areEqualArray(surrounding, ["0", "#", "0",
                                        "#", "#", "0",
                                        "0", "#", "0"]))
            return "9";

        if (areEqualArray(surrounding, ["0", "#", "0",
                                        "0", "#", "#",
                                        "0", "#", "0"]))
            return "10";

        if (areEqualArray(surrounding, ["0", "0", "0",
                                        "0", "#", "0",
                                        "0", "#", "0"]))
            return "11";

        if (areEqualArray(surrounding, ["0", "#", "0",
                                        "0", "#", "0",
                                        "0", "0", "0"]))
            return "12";

        if (areEqualArray(surrounding, ["0", "0", "0",
                                        "#", "#", "0",
                                        "0", "0", "0"]))
            return "13";

        if (areEqualArray(surrounding, ["0", "0", "0",
                                        "0", "#", "#",
                                        "0", "0", "0"]))
            return "14";

          return "0";
      break;
    default:
      return null;
  }
}

function areEqualArray(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
  }
  return true;
}
