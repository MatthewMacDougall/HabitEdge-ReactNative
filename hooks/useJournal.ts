import { useCallback, useReducer } from "react";
import { loadJournalEntries } from "@/utils/journalStorage";

export function useJournal() {
    const [state, dispatch] = useReducer(journalReducer, initialState);

    const loadEntries = useCallback(async () => {
        dispatch({ type: 'LOAD_START' });
        try {
            const entries = await loadJournalEntries();
            dispatch({ type: 'LOAD_SUCCESS', payload: entries });
        } catch (error) {
            dispatch({ type: 'LOAD_ERROR', payload: error.message });
        }
    }, []);
    return { state, loadEntries };
}

