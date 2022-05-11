import Service from '@ember/service';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Service.extend({
  router: inject(),

  orgs: computed('userOrganizations.[]', function() {
    const orgs = this.get('userOrganizations') || [];
    return orgs.map((org) => org.organization).sort((a, b) => a.name.localeCompare(b.name));
  }),
  apps: computed.map('orgAppQuery.organizationApplications', function(app) {
    return app;
  }),

  orgId: computed.reads('orgAppQuery.activeOrganization.id'),

  appId: computed.reads('app.id'),

  org: computed('orgId', function() {
    const orgId = this.get('orgId');
    return orgId ? this.get('orgAppQuery.activeOrganization') : {};
  }),

  userProfileIncomplete: computed('user.{givenName,familyName}', function() {
    if (!this.get('user.givenName')) return true;
    if (!this.get('user.familyName')) return true;
    return false;
  }),

  queryContextFor(scope, context) {
    if (scope === 'org') return this.orgQueryContext(context);
    if (scope === 'app') return this.appQueryContext(context);
    return context;
  },

  appQueryContext(context) {
    const appId = this.get('appId');
    return { ...context, appId };
  },

  orgQueryContext(context) {
    const orgId = this.get('orgId');
    return { ...context, orgId };
  },

  contextFromOptions(options) {
    return options && options.context ? options.context : {};
  },
});
