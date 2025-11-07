class Route {
    constructor(name, path, handler){
        this._name = name;
        this._path = path;
        this._handler = handler;
    }
    
    get name() {
        return this._name;
    }
    set name(name) {
        this._name = name;
    }

    get path() {
        return this._path;
    }
    set path(path) {
        this._path = path;
    }

    get handler() {
        return this._handler;
    }
    set handler(handler) {
        this._handler = handler;
    }
}

class Router {
    constructor() {
        this.mode = 'history';
        this.routes = [];
        this.root = '/';
    }

    add(route) {
        // accept either plain object or Route instance
        if (!(route instanceof Route) && route && typeof route === 'object') {
            route = new Route(route.name, route.path, route.handler);
        }
        this.routes.push(route);
        return this;
    }

    navigate(route) {
        route = route ? route : '';
        this.match(route);
    }

    match(route) {
        let matched = false;
        // support exact matches and simple parameterized routes like /users/:id
        for (let iroute of this.routes) {
            if (!iroute || !iroute.path) continue;
            // exact match
            if (iroute.path === route) {
                if (typeof iroute.handler === 'function') iroute.handler();
                this.location(route);
                matched = true;
                break;
            }

            // parameterized match: convert /path/:param to regex
            const paramNames = [];
            const regexPath = iroute.path.replace(/:([^/]+)/g, (_, name) => { paramNames.push(name); return '([^/]+)'; }) + '(?:\/|$)';
            const m = route.match(new RegExp('^' + regexPath));
            if (m) {
                const params = {};
                paramNames.forEach((n, i) => params[n] = m[i+1]);
                if (typeof iroute.handler === 'function') iroute.handler(params);
                if (typeof document !== 'undefined' && document.querySelector('title')) {
                    try { document.querySelector('title').innerText = `${AppName} | ${iroute.name}` } catch(e) {}
                }
                this.location(route);
                matched = true;
                break;
            }
        }
        /* for (let i = 0; i < this.routes.length; i++) {
            let paramNames = [];
            let regexPath = this.routes[i].path.replace(/([:*])(\w+)/g, (full, colon, name) => {
                paramNames.push(name);
                return '([^\/+])';
            }) + '(?:\/|$)';
            
            let routeMatch = route.match(new RegExp(regexPath));
            if (routeMatch !== null) {
                let params = routeMatch.slice(1, routeMatch.length).reduce((params, value, index) => {
                    if (params === null) {params = {}}
                    params[paramNames[index]] = value;
                    return params;
                }, null);

                if (params === null) {
                    this.routes[i].handler();
                } else {
                    this.routes[i].handler(params);
                }
                document.querySelector('title').innerText = `${AppName} | ${this.routes[i].name}`
                this.location(route)
                return
            }
            
        } */
        //alert(route)
        if(route === '/' || route === '' || route === null) return;
        if(matched === true) return;
        popUpBox('error', 'Invalid: Route not found!', 'acceptInvalid', 'none', () =>{
            clearPopUpBox();
            if(GetKeyValue(IsLoggedInKeyName) == 'true') {
                history.back()
                return
            }
            UserService.logout()
        })
    }
    
    location(route) {
        if (this.mode === 'history') {
            window.history.pushState(null, null, this.root + location.pathname + route.substring(1));
        } else {
            route = route.replace(/^\//, '').replace(/\/$/, '');
            //window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + route;
            window.history.pushState(null, null, window.location.href.replace(/#(.*)$/, '') + '#' + route);
        }          
    }
}

const _ROUTER = new Router();
_ROUTER.mode = 'hash';
_ROUTER.root = window.location.origin;

_ROUTER.add({name: 'Dashboard', path: '/dashboard', handler: () => Loader()});
_ROUTER.add({name: 'Welcome', path: '/welcome', handler: () => loadWelcome()});
_ROUTER.add({name: 'Home', path: '/', handler: () => loadWelcome()});
_ROUTER.add({name: 'Index', path: '', handler: () => loadWelcome()});
