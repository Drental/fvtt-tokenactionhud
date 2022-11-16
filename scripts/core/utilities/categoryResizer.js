export class CategoryResizer {
    static resizeHoveredCategory (catId) {
        function jq (myid) {
            return '#' + myid.replace(/(:|\.|\[|\]|,|=|@)/g, '\\$1')
        }

        const id = jq(catId)
        const category = $(id)

        if (!category[0]) return

        const content = category.find('.tah-subcategories')
        const isOneLineFit = category.hasClass('oneLine')
        const actions = category.find('.tah-actions')

        if (actions.length === 0) return

        const categoryId = catId.replace('tah-category-', '')
        const customWidth = game.user.getFlag(
            'token-action-hud',
            `categories.${categoryId}.advancedCategoryOptions.customWidth`
        )
        if (customWidth) return CategoryResizer.resizeActions(actions, customWidth)

        // reset content to original width
        const contentDefaultWidth = 300
        const minWidth = 200
        CategoryResizer.resizeActions(actions, contentDefaultWidth)

        const step = 30

        const bottomLimit = $(document).find('#hotbar').offset().top - 20
        const rightLimit = $(document).find('#sidebar').offset().left - 20

        const maxRequiredWidth = CategoryResizer.calculateMaxRequiredWidth(actions)
        while (
            CategoryResizer.shouldIncreaseWidth(
                content,
                actions,
                maxRequiredWidth,
                bottomLimit,
                rightLimit,
                isOneLineFit
            )
        ) {
            const box = actions[0].getBoundingClientRect()
            const boxWidth = box.width
            const cssWidth = actions.width()

            if (boxWidth > maxRequiredWidth) return

            const newWidth = cssWidth + step

            CategoryResizer.resizeActions(actions, newWidth)
        }

        while (
            CategoryResizer.shouldShrinkWidth(
                content,
                actions,
                minWidth,
                bottomLimit,
                rightLimit,
                isOneLineFit
            )
        ) {
            const box = actions[0].getBoundingClientRect()
            const boxWidth = box.width
            const cssWidth = actions.width()

            if (boxWidth < minWidth) return

            const newWidth = cssWidth - step

            CategoryResizer.resizeActions(actions, newWidth)
        }

        // SET MAX-HEIGHT
        const contentRect = content[0].getBoundingClientRect()
        const maxHeight =
      window.innerHeight - contentRect.top - (window.innerHeight - bottomLimit)
        const newHeight = maxHeight < 100 ? 100 : maxHeight
        content.css({ 'max-height': newHeight + 'px' })
    }

    static calculateMaxRequiredWidth (actions) {
        let maxWidth = 0

        actions.each(function () {
            const action = $(this)
            if (action.hasClass('excludeFromWidthCalculation')) return

            let totalWidth = 0
            Array.from(action.children()).forEach((c) => {
                const child = $(c)
                const childWidth = child.width()
                const marginWidth =
          parseInt(child.css('marginLeft')) +
          parseInt(child.css('marginRight'))

                totalWidth += childWidth + marginWidth + 5 // 5 is the gap width on parent element
            })
            totalWidth = totalWidth - 5 // Remove the last gap width as gaps only exist between buttons
            if (totalWidth > maxWidth) maxWidth = totalWidth
        })

        return maxWidth
    }

    static shouldIncreaseWidth (
        content,
        actions,
        maxRequiredWidth,
        bottomLimit,
        rightLimit,
        isOneLineFit
    ) {
        const contentRect = content[0].getBoundingClientRect()
        const actionsRect = actions[0].getBoundingClientRect()

        if (actionsRect.right >= rightLimit) return false

        if (actionsRect.width >= maxRequiredWidth) return false

        const actionArray = Array.from(content.find('.tah-action')).sort(
            (a, b) => $(a).offset().top - $(b).offset().top
        )
        const rows = CategoryResizer.calculateRows(actionArray)
        const columns = CategoryResizer.calculateMaxRowButtons(actionArray)
        if (contentRect.bottom <= bottomLimit && columns >= rows && !isOneLineFit) { return false }

        return true
    }

    static shouldShrinkWidth (
        content,
        actions,
        actionsMinWidth,
        bottomLimit,
        rightLimit,
        isOneLineFit
    ) {
        const contentRect = content[0].getBoundingClientRect()
        const actionsRect = actions[0].getBoundingClientRect()

        if (contentRect.bottom >= bottomLimit) return false

        if (actionsRect.width <= actionsMinWidth) return false

        const actionArray = Array.from(content.find('.tah-action')).sort(
            (a, b) => $(a).offset().top - $(b).offset().top
        )
        const rows = CategoryResizer.calculateRows(actionArray)
        const columns = CategoryResizer.calculateMaxRowButtons(actionArray)

        if (
            actionsRect.right <= rightLimit &&
      (rows >= columns - 1 || isOneLineFit)
        ) { return false }

        return true
    }

    static calculateRows (actionArray) {
        let rows = 0
        let currentTopOffset = 0
        const closeRange = 5

        actionArray.forEach((a) => {
            const offset = $(a).offset().top

            if (Math.abs(currentTopOffset - offset) >= closeRange) {
                rows++
                currentTopOffset = offset
            }
        })

        return rows
    }

    static calculateMaxRowButtons (actionArray) {
        if (actionArray.length < 2) return actionArray.length

        const rowButtons = []
        let currentTopOffset = 0
        let rowButtonCounter = 0
        const closeRange = 5

        actionArray.forEach((a) => {
            const offset = $(a).offset().top

            if (Math.abs(currentTopOffset - offset) >= closeRange) {
                if (rowButtonCounter >= 1) rowButtons.push(rowButtonCounter)

                currentTopOffset = offset
                rowButtonCounter = 1
            } else {
                rowButtonCounter++
            }

            // if it's the final object, add counter anyway in case it was missed.
            if (
                rowButtonCounter >= 1 &&
        actionArray.indexOf(a) === actionArray.length - 1
            ) { rowButtons.push(rowButtonCounter) }
        })

        return Math.max(...rowButtons)
    }

    static resizeActions (actions, newWidth) {
    // resize each action with new width
        Object.entries(actions)
            .filter(action => action[0] !== 'length' && action[0] !== 'prevObject')
            .forEach(action => {
                $(action[1]).css({ width: newWidth + 'px', 'min-width': newWidth + 'px' })
            })
    }
}
