import { ref } from 'vue';

type ListState = {
  page: number;
  search: string;
  draftSearch: string;
};

export function useListState() {
  const state = ref<ListState>({
    page: 1,
    search: '',
    draftSearch: '',
  });

  const setDraftSearch = (draftSearch: string) => {
    state.value = { ...state.value, draftSearch };
  };

  const setPage = (page: number) => {
    const nextPage = page > 0 ? page : 1;
    if (state.value.page !== nextPage) {
      state.value = { ...state.value, page: nextPage };
    }
  };

  const submitSearch = (nextDraftSearch?: string) => {
    const nextSearch = (nextDraftSearch ?? state.value.draftSearch).trim();
    state.value = {
      page: 1,
      search: nextSearch,
      draftSearch: nextSearch,
    };
  };

  const clearSearch = () => {
    state.value = {
      page: 1,
      search: '',
      draftSearch: '',
    };
  };

  return {
    page: computed(() => state.value.page),
    search: computed(() => state.value.search),
    draftSearch: computed(() => state.value.draftSearch),
    setPage,
    setDraftSearch,
    submitSearch,
    clearSearch,
  };
}
