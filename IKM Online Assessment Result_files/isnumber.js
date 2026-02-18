function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isInteger(n) {
    if (!isNumber(n)) {
        return false;
    }

    if (n.indexOf(".") > 0) {
        return false;
    }

    return true;
}

function isIntegerInRange(n, minN, maxN) {
    if (!isInteger(n)) {
        return false;
    }

    const num = parseInt(n,10)  ;
    if (minN != null && num < parseInt(minN,10) ) {
        return false;
    }

    if (maxN != null && num > parseInt(maxN,10) ) {
        return false;
    }

    return true;
}
