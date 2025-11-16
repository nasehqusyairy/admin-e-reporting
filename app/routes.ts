import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    layout('components/layouts/default.tsx', [
        index("routes/dashboard.tsx"),
        route('/audits', 'routes/audits/index.tsx', [
            route('removed', 'routes/audits/removed.tsx')
        ]),
        route('/categories', 'routes/categories/index.tsx', [
            route('removed', 'routes/categories/removed.tsx')
        ]),
        route('/subcategories', 'routes/subcategories/index.tsx', [
            route('removed', 'routes/subcategories/removed.tsx')
        ])
    ]),
    route('/auth', 'routes/login.tsx')
] satisfies RouteConfig;
