import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout('components/layouts/default.tsx', [
        index("routes/dashboard.tsx"),
        route('/audits', 'routes/audits/index.tsx', [
            route('', 'routes/audits/available.tsx', [
                route('removed', 'routes/audits/removed.tsx')
            ]),
            route('create', 'routes/audits/create.tsx'),
            route(':id', 'routes/audits/edit.tsx'),
            route('remove', 'routes/audits/remove.tsx')
        ]),
        route('/categories', 'routes/categories/index.tsx', [
            route('', 'routes/categories/available.tsx', [
                route('removed', 'routes/categories/removed.tsx')
            ]),
            route('create', 'routes/categories/create.tsx'),
            route(':id', 'routes/categories/edit.tsx'),
            route('remove', 'routes/categories/remove.tsx')
        ]),
        route('/subcategories', 'routes/subcategories/index.tsx', [
            route('', 'routes/subcategories/available.tsx', [
                route('removed', 'routes/subcategories/removed.tsx')
            ]),
            route('create', 'routes/subcategories/create.tsx'),
            route(':id', 'routes/subcategories/edit.tsx'),
            route('remove', 'routes/subcategories/remove.tsx')
        ]),
    ]),
    route('/audits/export', 'routes/audits/export.tsx'),
    route('/audits/template', 'routes/audits/template.tsx'),
    route('/login', 'routes/login.tsx'),
    route('/logout', 'routes/logout.tsx')
] satisfies RouteConfig;
