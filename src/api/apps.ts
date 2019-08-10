import * as api from './api';
import logger from '../logger';

interface App {
    id: string;
    stack?: string; // TODO: make this required
    size: number;
    replicas: number;
    region: string;
    cloud: string;
}

type Cloud = 'gcp' | 'aws'
type GcpRegion = 'v2018-us-central1' | 'europe-west1'
type AwsRegion = 'us-east-1' | 'us-west-2'

interface CloudRegion {
    cloud: Cloud;
}

interface Aws extends CloudRegion {
    cloud: 'aws';
    region: AwsRegion;
}

interface Gcp extends CloudRegion {
    cloud: 'gcp';
    region: GcpRegion;
}

/* eslint-disable @typescript-eslint/camelcase */
// using object spread operator to copy over all fields except unique_name field
const renameIds = (apps: {unique_name: string; stack: string; size: number; replicas: number; region: string; cloud: string}[]): App[] => {
    return apps.map(({ unique_name, ...others }): App => ({
        id: unique_name, ...others,
    }));
}

export const list = (): Promise<{ data: App[]; total: number }> => {
    return api.get('/frontend/api/apps')
        .then((response): {data: App[]; total: number} => {
            const apps = response.data.data;
            return {
                data: renameIds(apps),
                total: apps.length,
            };
        });
}

export const get = (id: string): Promise<{ data: App }> => {
    return api.get('/frontend/api/apps/' + id)
        .then((response): {data: App } => {
            const { unique_name, ...others } = response.data;
            return {
                data: {
                    id: unique_name,
                    ...others
                }
            };
        });
}

function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const readableError = (errors: {[k: string]: string[]}): string => {
    return Object.keys(errors).map(function(key): string {
        // hack to map unique_name to name
        let name = key
        if (name === "unique_name") {
            name = "name"
        }
        name = capitalizeFirstLetter(name)
        return `${name} ${errors[key][0]}`
    }).join(". ")
}

export const create = (name: string, cloud: string, region: string): Promise<{}> => {
    logger.info(name)
    return api.post('/frontend/api/apps', {
        unique_name: name,
        cloud: cloud,
        region: region
    }).then((response: {data: {unique_name: string; replicas: number; size: number}}): {data: App} => {
        const app = response.data;
        return {data: {
            id: app.unique_name,
            cloud: cloud,
            region: region,
            replicas: app.replicas,
            size: app.size,
        }}
    }).catch((error): never => {
        const errors = error.response.data.errors;
        const result = readableError(errors)
        throw new Error(result);
    })
}
/* eslint-enable @typescript-eslint/camelcase */
