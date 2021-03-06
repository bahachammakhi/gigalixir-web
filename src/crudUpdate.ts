// pretty much copied from https://github.com/marmelab/react-admin/blob/master/packages/ra-core/src/actions/dataActions/crudCreate.ts
// except, notification onFailure is optional
import {
  Identifier,
  NotificationSideEffect,
  RedirectionSideEffect,
  RefreshSideEffect
} from 'ra-core'
import { CRUD_UPDATE, UPDATE } from 'react-admin'
import { FailureCallback, SuccessCallback } from './callbacks'

interface RequestPayload {
  id: Identifier
  data: {}
  previousData?: {}
}

export interface CrudUpdateAction {
  readonly type: typeof CRUD_UPDATE
  readonly payload: RequestPayload
  readonly meta: {
    resource: string
    fetch: typeof UPDATE
    onSuccess: {
      callback?: Function
      notification?: NotificationSideEffect
      redirectTo: RedirectionSideEffect
      refresh: RefreshSideEffect
      basePath: string
    }
    onFailure: {
      callback?: Function
      notification?: NotificationSideEffect
    }
  }
}

export const crudUpdate = (
  resource: string,
  id: Identifier,
  data: {},
  previousData: {},
  basePath: string,
  // successNotification: string,
  redirectTo: RedirectionSideEffect = 'show',
  refresh: RefreshSideEffect = true,
  successCallback: SuccessCallback,
  failureCallback: FailureCallback
): CrudUpdateAction => ({
  type: CRUD_UPDATE,
  payload: { id, data, previousData },
  meta: {
    resource,
    fetch: UPDATE,
    onSuccess: {
      callback: successCallback,
      // notification: {
      //     body: successNotification,
      //     level: 'info',
      //     messageArgs: {
      //         smart_count: 1,
      //     },
      // },
      refresh,
      redirectTo,
      basePath
    },
    onFailure: {
      callback: failureCallback
      // callback: (params: any) => {
      // reject(new SubmissionError(params.payload.errors))
      // }
      /* notification: { */
      /*     body: 'ra.notification.http_error', */
      /*     level: 'warning', */
      /* }, */
    }
  }
})
