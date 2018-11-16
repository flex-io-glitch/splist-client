import ApolloClient from 'apollo-client';

import { WebSocketLink } from 'apollo-link-ws';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { withClientState } from 'apollo-link-state';

import { split, ApolloLink, Observable  } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';

interface CreateClientOptions {
    uri: string;
    token: string;
}

export const createClient = ({ uri, token }: CreateClientOptions) => {

    const { httpUrl, wsUrl } = createUrls(uri);

    // TODO: Fix lint errors
    const errorLink = onError(({ graphQLErrors, networkError }) => {
        // tslint:disable 
        if (graphQLErrors)
            graphQLErrors.map(({ message, locations, path }) =>
                console.log(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
                ),
            );
        if (networkError) console.log(`[Network error]: ${networkError}`);
        // tslint:enable
    });

    // TODO: Add client state
    const stateLink = withClientState();

    // Websocket for subscriptions
    const wsLink = new WebSocketLink({
        uri: wsUrl,
        options: {
            reconnect: true,
        },
    });

    // Http for everything else
    const httpLink = new HttpLink({
        uri: httpUrl,
    });

    // Split between ws and http based on operation type
    const networkLink = split(
        ({ query }) => {
            const { kind, operation } = getMainDefinition(query);

            return kind === 'OperationDefinition' && operation === 'subscription';
        },
        wsLink,
        httpLink,
    );

    // Concat all the links
    const link = ApolloLink.from([
        errorLink,
        stateLink,
        networkLink,
    ]);

    // Return a client
    return new ApolloClient({
        link,
        cache: new InMemoryCache(),
    });
};

// Bad url thing for now
const createUrls = (base: string, secure = true) => ({
    httpUrl: `http${secure ? 's' : ''}://${base}`,
    wsUrl: `ws${secure ? 's' : ''}://${base}`,
});
