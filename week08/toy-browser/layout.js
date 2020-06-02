const WIDTH = 'width';
const HEIGHT = 'height';
const TOP = 'top';
const BOTTOM = 'bottom'
const LEFT = 'left';
const RIGHT = 'right';

function getStyle(element) {
    if (!element.style) {
        // 赋默认值
        element.style = {

        };
    }
    for (let prop in element.computeStyle) {
        // ???
        const p = element.computeStyle.value;

        if (/px$/.test(element.computeStyle[prop].value.toString())) {
            element.style[prop] = parseInt(element.computeStyle[prop].value)
        } else if (/^[0-9\.]+$/.test(element.computeStyle[prop].value.toString())) {
            element.style[prop] = parseInt(element.computeStyle[prop].value)
        } else {
            element.style[prop] = element.computeStyle[prop].value;
        }
    }
    return element.style;
}

function layout(element) {
    if (!element.computeStyle) {
        return;
    }
    const eleStyle = getStyle(element)
    if (eleStyle.display !== 'flex') {
        return;
    }
    const items = element.children.filter(e => e.type === 'element');

    items.sort((a, b) => (a.order || 0) - (b.order || 0))

    const style = eleStyle;

    ['width', 'height'].forEach(size => {
        if (['auto', ''].includes(style[size])) {
            style[size] = null;
        }
    })

    if (!style.flexDirection || style.flexDirection === 'auto') {
        style.flexDirection = 'row'
    }
    if (!style.alignItems || style.alignItems === 'auto') {
        style.alignItems = 'stretch'
    }
    if (!style.justifyContent || style.justifyContent === 'auto') {
        style.justifyContent = 'flex-start'
    }
    if (!style.flexWrap || style.flexWrap === 'auto') {
        style.flexWrap = 'nowrap'
    }
    if (!style.alignContent || style.alignContent === 'auto') {
        style.alignContent = 'stretch'
    }
    let mainSize, mainStart, mainEnd, mainSign, mainBase,
        crossSize, crossStart, crossEnd, crossSign, crossBase;

    switch (style.flexDirection) {
        case 'row': {
            mainSize = WIDTH;
            mainStart = LEFT;
            mainEnd = RIGHT;
            mainSign = +1;
            mainBase = 0;

            crossSize = HEIGHT;
            crossStart = TOP;
            crossEnd = BOTTOM;
            break;
        }
        case 'row-reverse': {
            mainSize = WIDTH;
            mainStart = RIGHT;
            mainEnd = LEFT;
            mainSign = -1;
            mainBase = style[mainSize];

            crossSize = HEIGHT;
            crossStart = TOP;
            crossEnd = BOTTOM;
            break;
        }
        case 'column': {
            mainSize = HEIGHT;
            mainStart = TOP;
            mainEnd = BOTTOM;
            mainSign = +1;
            mainBase = 0;

            crossSize = WIDTH;
            crossStart = LEFT;
            crossEnd = RIGHT;
            break;
        }
        case 'column-reverse': {
            mainSize = HEIGHT;
            mainStart = BOTTOM;
            mainEnd = TOP;
            mainSign = -1;
            mainBase = style[mainSize];

            crossSize = WIDTH;
            crossStart = LEFT;
            crossEnd = RIGHT;
            break;
        }
        default: {
            break;
        }
    }

    if (style.flexWrap === 'wrap-reverse') {
        [crossStart, crossEnd] = [crossEnd, crossStart]
        // ??crossBase
        crossSign = -1;
    } else {
        crossBase = 0;
        crossSign = +1
    }


    let isAutoMainSize = false;
    if (!style[mainSize]) {
        eleStyle[mainSize] = 0;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            const itemStyle = getStyle(item)
            // ??itemStyle
            if (itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0)) {
                eleStyle[mainSize] += itemStyle[mainSize]
            }
        }
        isAutoMainSize = true;
    }


    let flexLine = [];
    let flexLines = [flexLine]

    let mainSpace = eleStyle[mainSize];
    let crossSpace = 0;

    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const itemStyle = getStyle(item)
        if (itemStyle[mainSize] === null) {
            itemStyle[mainSize] = 0;
        }

        if (itemStyle.flex) {
            flexLine.push(item)
        } else if (style.flexWrap === 'nowrap' && isAutoMainSize) {
            mainSpace -= itemStyle[mainSize];
            if (itemStyle[crossSize] !== null && itemStyle[crossSize]) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize])
            }
            flexLine.push(item)
        } else {
            if (itemStyle[mainSize] > style[mainSize]) {
                itemStyle[mainSize] = style[mainSize]
            }
            if (itemStyle[mainSize] > mainSpace) {
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;
                flexLine = [item];
                flexLines.push(flexLine);
                mainSpace = style[mainSize];
                crossSpace = 0;
            } else {
                flexLine.push(item)
            }
            if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize])
            }

            mainSpace -= itemStyle[mainSize];
            console.log(mainSpace)
        }
    }

    flexLine.mainSpace = mainSpace;
    if (style.flexWrap === 'nowrap' || isAutoMainSize) {
        flexLine.crossSpace = (style[crossSize] !== (void 0)) ? style[crossSize] : crossSpace;
    } else {
        flexLine.crossSpace = crossSpace;
    }

    if (mainSpace < 0) {
        const scale = style[mainSize] / (style[mainSize] - mainSpace);
        let curMain = mainBase;
        for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const itemStyle = getStyle(item);
            if (item.flex) {
                item[mainSize] = 0;
            }

            itemStyle[mainSize] *= scale;

            itemStyle[mainStart] = curMain;
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
            curMain = itemStyle[mainEnd];
        }
    } else {
        flexLines.forEach(flexLine => {
            let mainSpace = flexLine.mainSpace;
            let flexTotal = 0;
            for (let i = 0; i < flexLine.length; i++) {
                const item = flexLine[i]
                const itemStyle = getStyle(item);
                if (itemStyle.flex !== null && itemStyle.flex !== (void 0)) {
                    flexTotal += itemStyle.flex;
                    continue;
                }
            }

            if (flexTotal > 0) {
                let curMain = mainBase;
                for (let i = 0; i < flexLine.length; i++) {
                    const item = flexLine[i]
                    const itemStyle = getStyle(item);
                    if (itemStyle.flex) {
                        itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex;
                    }

                    itemStyle[mainStart] = curMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    curMain = itemStyle[mainEnd];
                }
            } else {
                let curMain = mainBase;
                let step = 0;
                switch (style.justifyContent) {
                    case 'flex-start': {
                        curMain = mainBase;
                        step = 0;
                        break;
                    }
                    case 'flex-end': {
                        curMain = mainSpace * mainSign + mainBase;
                        step = 0;
                        break;
                    }
                    case 'center': {
                        curMain = mainSpace / 2 * mainSign + mainBase;
                        step = 0;
                        break;
                    }
                    case 'space-between': {
                        curMain = mainBase;
                        step = mainSpace / (flexLine.length - 1);
                        break;
                    }
                    case 'space-around': {
                        step = mainSpace / flexLine.length * mainSign;
                        curMain = step / 2 + mainBase;
                        break;
                    }
                    default: break;
                }

                for (let i = 0; i < flexLines.length; i++) {
                    const item = flexLine[i]
                    const itemStyle = getStyle(item);

                    itemStyle[mainStart] = curMain;
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize];
                    curMain = itemStyle[mainEnd] + step;
                }
            }
        })
    }

    if (!style[crossSize]) {
        crossSpace = 0;
        eleStyle[crossSize] = 0;
        for (let i = 0; i < flexLines.length; i++) {
            eleStyle[crossSize] += flexLines[i].crossSpace;
        }
    } else {
        crossSpace = style[crossSize]
        for (let i = 0; i < flexLines.length; i++) {
            crossSpace -= flexLines[i].crossSpace;
        }
    }

    console.log(crossSpace)

    if (style.flexWrap === 'wrap-reverse') {
        crossBase = style[crossSize]
    } else {
        crossBase = 0;
    }

    let lineSize = style[crossSize] / flexLines.length;
    let step = 0;

    switch (style.alignContent) {
        case 'flex-start': {
            crossBase += 0;
            step = 0;
            break;
        }
        case 'flex-end': {
            crossBase += crossSign * crossSpace;
            step = 0;
            break;
        }
        case 'center': {
            crossBase += crossSign * crossSpace / 2;
            step = 0;
            break;
        }
        case 'space-between': {
            crossBase += 0;
            step = crossSpace / (flexLines.length - 1);
            break;
        }
        case 'space-around': {
            step = crossSpace / flexLines.length;
            crossBase += crossSign * step / 2;
            break;
        }
        case 'stretch': {
            step = 0;
            crossBase += 0;
            break;
        }
    }

    flexLines.forEach(flexLine => {
        let lineCrossSize = style.alignContent === 'stretch' ?
            flexLine.crossSpace + crossSpace / flexLines.length :
            flexLine.crossSpace;

        for (let i = 0; i < flexLine.length; i++) {
            const item = flexLine[i]
            const itemStyle = getStyle(item);

            const align = itemStyle.alignSelf || style.alignItems;

            if (itemStyle[crossSize] === null) {
                itemStyle[crossSize] = align === 'stretch' ? lineCrossSize : 0;
            }

            switch (align) {
                case 'flex-start': {
                    itemStyle[crossStart] = crossBase;
                    itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
                    break;
                }
                case 'flex-end': {
                    itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize;
                    itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize]
                    break;
                }
                case 'center': {
                    itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2;
                    itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
                    break;
                }
                case 'stretch': {
                    itemStyle[crossStart] = crossBase;
                    itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0) ? itemStyle[crossSize] : lineCrossSize)

                    itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart])
                    break;
                }
                default: break;
            }
        }
        crossBase += crossSign * (lineCrossSize + step);
    })
    console.log(items)
}

module.exports.layout = layout;