import ApolloClient from 'apollo-client';

import { WebSocketLink } from 'apollo-link-ws';
import { HttpLink } from 'apollo-link-http';

import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';

interface CreateClientOptions {
  uri: string;
}

export const createClient = ({ uri }: CreateClientOptions) => {

    const { httpUrl, wsUrl } = createUrls(uri);

    const wsLink = new WebSocketLink({
        uri: wsUrl,
        options: {
            reconnect: true,
        },
    });

    const httpLink = new HttpLink({
        uri: httpUrl,
    });

    const link = split(
        // Split based on operation type
        ({ query }) => {
            const { kind, operation } = getMainDefinition(query);

            return kind === 'OperationDefinition' && operation === 'subscription';
        },
        wsLink,
        httpLink,
    );

    return new ApolloClient({
        link,
        cache: new InMemoryCache(),
    });
};

const createUrls = (base: string, secure = true) => ({
    httpUrl: `http${secure ? 's' : ''}://${base}`,
    wsUrl: `ws${secure ? 's' : ''}://${base}`,
});
