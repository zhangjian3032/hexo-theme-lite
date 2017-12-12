
import { app, store, router } from './main';

// todo: Vue mixin Route Update

router.onReady(async () => {
  router.beforeResolve(async (to, from, next) => {
    const matched = router.getMatchedComponents(to);
    const prevMatched = router.getMatchedComponents(from);

    let diffed = false;
    const activated = matched.filter((component, index) => {
      return diffed || (diffed = (prevMatched[ index ] !== component));
    });

    if (!activated.length) {
      return next();
    }

    console.log(activated);

    try {
      app.$nprogress.start();
      const hooks = activated.map((c: any) => c.asyncData || c.options.asyncData).filter(_ => _);
      await Promise.all(hooks.map(hook => hook({ store, route: to })));
      app.$nprogress.done();
      next();
    } catch (error) {
      next(error);
    }
  });

  // Fetch initial state
  const initMatched = router.getMatchedComponents(router.currentRoute);
  const asyncDataHooks = initMatched.map((c: any) => c.asyncData || c.options.asyncData).filter(_ => _);
  await Promise.all(asyncDataHooks.map(hook => hook({ store, route: router.currentRoute })));

  // Start!
  app.$mount('#app');

});


