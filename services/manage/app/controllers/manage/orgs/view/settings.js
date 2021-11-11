import Controller from '@ember/controller';
import ActionMixin from '@identity-x/manage/mixins/action-mixin';
import OrgQueryMixin from '@identity-x/manage/mixins/org-query';
import { inject } from '@ember/service';
import gql from 'graphql-tag';
import orgCompanyFragment from '@identity-x/manage/graphql/fragments/organization-company';

const mutation = gql`
  mutation SaveOrganizationSettings($input: UpdateOrganizationMutationInput!) {
    updateOrganization(input: $input) {
      id
      name
      description
      consentPolicy
      emailConsentRequest
      appUserAllowedStaleDays
    }
  }
`;

const setOrganizationCompanyInfo = gql`
  mutation SaveOrganizationCompanyInfo($input: SetOrganizationCompanyInfoMutationInput!) {
    setOrganizationCompanyInfo(input: $input) {
      id
      company {
        ...OrganizationCompanyFragment
      }
    }
  }

  ${orgCompanyFragment}
`;

export default Controller.extend(ActionMixin, OrgQueryMixin, {
  errorNotifier: inject(),

  actions: {
    async save() {
      try {
        this.startAction({ prop: 'isSaving' });
        const {
          id,
          name,
          description,
          consentPolicy,
          emailConsentRequest,
        } = this.model;
        const appUserAllowedStaleDays = parseFloat(this.model.appUserAllowedStaleDays);
        const payload = {
          name,
          description,
          consentPolicy,
          emailConsentRequest,
          appUserAllowedStaleDays: appUserAllowedStaleDays > 0 ? appUserAllowedStaleDays : null,
        };
        const input = { id, payload };
        const variables = { input };
        await this.mutate({ mutation, variables }, 'updateOrganization');
      } catch (e) {
        this.errorNotifier.show(e);
      } finally {
        this.endAction({ prop: 'isSaving' });
      }
    },

    async saveCompanyInfo() {
      try {
        this.startAction({ prop: 'isSavingCompanyInfo' });
        const { company } = this.model;
        const {
          name,
          streetAddress,
          city,
          regionName,
          postalCode,
          phoneNumber,
          supportEmail,
        } = company || {};
        const payload = {
          name,
          streetAddress,
          city,
          regionName,
          postalCode,
          phoneNumber,
          supportEmail,
        };
        const input = { company: payload };
        const variables = { input };
        await this.mutate({ mutation: setOrganizationCompanyInfo, variables }, 'setOrganizationCompanyInfo');
      } catch (e) {
        this.errorNotifier.show(e);
      } finally {
        this.endAction({ prop: 'isSavingCompanyInfo' });
      }
    },
  }
})
