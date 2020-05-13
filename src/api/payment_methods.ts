import _ from 'lodash/fp'
import { HttpError } from 'ra-core'
import * as api from './api'

interface Response {
  brand: string
  exp_month: number
  exp_year: number
  last4: number
}

export interface PaymentMethod {
  id: 'ignored' // react-admin checks this
  brand: string
  expMonth: number
  expYear: number
  last4: number
}

interface ErrorResponse {
  errors: { [x: string]: string[] }
}
export const update = (token: string): Promise<{ data: {} }> => {
  return api
    .put<{ data: {} }>(`/frontend/api/payment_methods`, {
      // eslint-disable-next-line @typescript-eslint/camelcase
      stripe_token: token
    })
    .then((): { data: { id: string } } => {
      return { data: { id: token } }
    })
    .catch((reason: { response: { data: ErrorResponse; status: number } }) => {
      const { errors } = reason.response.data
      throw new HttpError(
        _.join('. ', errors.stripe_token),
        reason.response.status,
        {
          errors
        }
      )
    })
}

export const get = (): Promise<{ data: PaymentMethod }> => {
  return api
    .get<{ data: { data: Response } }>('/frontend/api/payment_methods')
    .then((response): { data: PaymentMethod } => {
      return {
        data: {
          id: 'ignored',
          brand: response.data.data.brand,
          expMonth: response.data.data.exp_month,
          expYear: response.data.data.exp_year,
          last4: response.data.data.last4
        }
      }
    })
}
