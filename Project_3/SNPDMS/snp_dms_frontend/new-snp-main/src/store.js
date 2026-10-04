import { createStore, applyMiddleware, compose } from 'redux';
import {thunk} from 'redux-thunk';

import rootReducer from './reducers';

import { loadState, saveState } from './localStorage';
const persistedState = loadState();

// const initialState = {};

const middleware = [thunk];
const composeEnhancers =
  typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const enhancer = composeEnhancers(applyMiddleware(...middleware));

// const store = createStore(rootReducer, initialState, enhancer);
const store = createStore(rootReducer, persistedState, enhancer);

store.subscribe(() => {
  saveState({
    stocksAllotment: store.getState().stocksAllotment,
    ui: store.getState().ui,
  });
});

if (persistedState === undefined) {
  saveState({
    stocksAllotment: store.getState().stocksAllotment,
    ui: store.getState().ui,
  });
}

export default store;
