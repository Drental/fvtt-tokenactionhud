/**
 * Enable stylesheet based on setting and disable all other stylesheets
 * @param {string} settingValue 'style' module setting value
 */
export function switchCSS (settingValue) {
    const styles = [
        { setting: 'compact', file: 'tah-compact' },
        { setting: 'foundryVTT', file: 'token-action-hud' },
        { setting: 'dorakoUI', file: 'tah-dorako' }
    ]

    for (const style of styles) {
        const href = ['modules/token-action-hud/', `styles/${style.file}`]
        if (style.setting === settingValue) {
            Object.values(document.styleSheets).find(
                (ss) => ss.href?.includes(href[0]) && ss.href?.includes(href[1])
            ).disabled = false
        } else {
            Object.values(document.styleSheets).find(
                (ss) => ss.href?.includes(href[0]) && ss.href?.includes(href[1])
            ).disabled = true
        }
    }
}

/**
 * Loop nested subcategories and return flattened
 * @param {object} subcategories
 * @returns {object}
 */
export function getSubcategories (subcategories) {
    const result = []
    for (const subcategory of subcategories) {
        if (subcategory.subcategories.length > 0) {
            result.push(getSubcategories(subcategory.subcategories).flat())
        }
        result.push(subcategory)
    }
    return result.flat()
}

/**
 * Loop nested subcategories, find subcategories matching id, and return flattened
 * @param {object} subcategories
 * @param {string} id
 * @returns {object}
 */
export function getSubcategoriesById (subcategories, id) {
    if (!subcategories) return
    const result = []
    for (const subcategory of subcategories) {
        if (subcategory.subcategories?.length > 0) {
            result.push(getSubcategoriesById(subcategory.subcategories, id).flat())
        }
        if (subcategory.id === id) {
            result.push(subcategory)
        }
    }
    return result.flat()
}

/**
 * Loop nested subcategories, find subcategories matching nestId, and return flattened
 * @param {object} subcategories
 * @param {string} nestId
 * @returns {object}
 */
export function getSubcategoryByNestId (subcategories, nestId) {
    for (const subcategory of subcategories) {
        if (subcategory.nestId === nestId) {
            return subcategory
        } else if (subcategory.subcategories.length > 0) {
            const result = getSubcategoryByNestId(subcategory.subcategories, nestId)
            if (result) return result
        }
    }
}
