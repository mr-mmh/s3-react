type AType = "add" | "update" | "replace";

/** this is create a reducer for easy state management. this is base on state that is an array of object that any object must have a unique id.
 * @tutorial payload: payload is a contain whole object not just id.
 */
export function createReducer<TState extends { id: string }>(
    currentState: Array<TState>,
    action:
        | { type: AType; payload: Array<TState> }
        | { type: "remove"; payload: Array<string> }
        | { type: "patch"; payload: Array<Partial<TState>> },
): Array<TState> {
    switch (action.type) {
        case "add":
            return [...currentState, ...action.payload];
        case "remove":
            const idsToRemove = action.payload;
            return currentState.filter((item) => !idsToRemove.includes(item.id));
        case "update":
            return currentState.map((item) => {
                const index = action.payload.findIndex(
                    (updatedItem) => updatedItem.id === item.id,
                );
                return index !== -1 ? action.payload[index] : item;
            });
        case "patch":
            return currentState.map((item) => {
                const index = action.payload.findIndex(
                    (updatedItem) => updatedItem.id === item.id,
                );
                return index !== -1 ? { ...item, ...action.payload[index] } : item;
            });
        case "replace":
            return [...action.payload];
        default:
            return currentState;
    }
}
