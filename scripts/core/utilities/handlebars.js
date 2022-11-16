import * as settings from '../settings.js'

export function registerHandlerbars () {
    Handlebars.registerHelper('cap', function (string) {
        if (!string || string.length < 1) return ''
        return string[0].toUpperCase() + string.slice(1)
    })

    const reduceOp = function (args, reducer) {
        args = Array.from(args)
        args.pop() // => options
        const first = args.shift()
        return args.reduce(reducer, first)
    }

    Handlebars.registerHelper({
        eq: function () { return reduceOp(arguments, (a, b) => a === b) },
        ne: function () { return reduceOp(arguments, (a, b) => a !== b) },
        lt: function () { return reduceOp(arguments, (a, b) => a < b) },
        gt: function () { return reduceOp(arguments, (a, b) => a > b) },
        lte: function () { return reduceOp(arguments, (a, b) => a <= b) },
        gte: function () { return reduceOp(arguments, (a, b) => a >= b) },
        and: function () { return reduceOp(arguments, (a, b) => a && b) },
        or: function () { return reduceOp(arguments, (a, b) => a || b) }
    })

    Handlebars.registerHelper('activeText', function (block) {
        if (settings.get('activeCssAsText')) {
            return block.fn(this)
        }

        return block.inverse(this)
    })

    loadTemplates([
        'modules/token-action-hud/templates/category.hbs',
        'modules/token-action-hud/templates/subcategory.hbs',
        'modules/token-action-hud/templates/action.hbs',
        'modules/token-action-hud/templates/tagdialog.hbs'
    ])
}
