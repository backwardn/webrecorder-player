import config from 'config';
import { fromJS } from 'immutable';
import { rts } from 'helpers/utils';

const COLL_CLEAR = 'wr/coll/COLL_CLEAR';

const COLL_LOAD = 'wr/coll/LOAD';
const COLL_LOAD_SUCCESS = 'wr/coll/LOAD_SUCCESS';
const COLL_LOAD_FAIL = 'wr/coll/LOAD_FAIL';

const COLL_SET_SORT = 'wr/coll/COLL_SET_SORT';
const COLL_SET_PUBLIC = 'wr/coll/SET_PUBLIC';
const COLL_SET_PUBLIC_SUCCESS = 'wr/coll/SET_PUBLIC_SUCCESS';
const COLL_SET_PUBLIC_FAIL = 'wr/coll/SET_PUBLIC_FAIL';

export const defaultSort = { sort: 'timestamp', dir: 'DESC' };
const initialState = fromJS({
  loading: false,
  loaded: false,
  error: null,
  sortBy: defaultSort
});


export default function collection(state = initialState, action = {}) {
  switch (action.type) {
    case COLL_CLEAR:
      return state.set('loaded', false);
    case COLL_LOAD:
      return state.set('loading', true);
    case COLL_LOAD_SUCCESS: {
      const {
        bookmarks,
        collection: { created_at, desc, download_url, id, recordings, size, title },
        user
      } = action.result;

      const bks = {};
      bookmarks.forEach((bookmark) => { bks[bookmark.id] = bookmark; });

      return state.merge({
        loading: false,
        loaded: true,
        accessed: action.accessed,
        error: null,

        bookmarks: bks,
        created_at,
        desc,
        download_url,
        id,
        isPublic: action.result.collection['r:@public'],
        recordings,
        size,
        title,
        user,
      });
    }
    case COLL_LOAD_FAIL:
      return state.merge({
        loading: false,
        loaded: false,
        error: action.error
      });
    case COLL_SET_SORT:
      return state.merge({
        sortBy: action.sortBy
      });

    default:
      return state;
  }
}

export function isLoaded({ app }) {
  return app.get('collection') &&
         app.getIn(['collection', 'loaded']);
}

export function load(username, coll, host = '') {
  return {
    types: [COLL_LOAD, COLL_LOAD_SUCCESS, COLL_LOAD_FAIL],
    accessed: Date.now(),
    promise: client => client.get(`${host}api/v1/collections/${coll}?user=${username}`)
  };
}

export function setSort(sortBy) {
  return {
    type: COLL_SET_SORT,
    sortBy
  };
}

export function clearColl() {
  return {
    type: COLL_CLEAR,
  }
}