# 实现复合选择器，实现支持空格的 Class 选择器（选做）   
```javascript
function classSelect(query) {
    var res = []
    if (document.querySelectorAll) {
        res = document.querySelectorAll(query)
    } else {
        var firstStyleSheet = document.styleSheets[0] || document.createStyleSheet()
        query = query.split(',')
        for (var i = 0, len = queyy.length; i < len; i++) {
            firstStyleSheet.addRule(query[i], 'Hack:ie')
        }
        for (var i = 0, len = document.all.length; i < len; i++) {
            var item = document.all[i]
            item.currentStyle.Hack && res.push(item)
        }
        firstStyleSheet.removeRule(0)
    }
    var ret = []
    for(var i = 0, len = res.length; i < len; i++) {
        ret.push(res[i])s
    }
    return ret
}

```