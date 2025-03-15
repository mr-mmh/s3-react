import { useCallback, useMemo, useState } from "react";

type ToggleConfig = {
    init?: boolean;
    preToggle?: (open: boolean) => void;
};

type ToggleOptions<K> = {
    [key in keyof K]: ToggleConfig;
};

type ToggleState<K> = {
    [Key in keyof K]: boolean;
};

type ToggleStateIsOpen<K> = {
    [Key in keyof K as `isOpen${Capitalize<Key & string>}`]: boolean;
};

export function useToggles<K>(toggles: ToggleOptions<K>) {
    const [_toggles] = useState(toggles);
    const [openStates, setOpenStates] = useState<ToggleState<K>>(() => {
        const initialToggles: any = {};
        for (const key in toggles) {
            initialToggles[`isOpen${key}`] = toggles[key].init ?? false;
        }
        return initialToggles as ToggleState<K>;
    });

    const toggle = useCallback(
        (key: keyof K, open?: boolean) => {
            if (_toggles[key]?.preToggle) {
                _toggles[key].preToggle(openStates[key]);
            }
            if (open !== undefined) {
                return setOpenStates((prev) => ({ ...prev, [key]: open }));
            }
            setOpenStates((prev) => ({ ...prev, [key]: !prev[key] }));
        },
        [_toggles, openStates],
    );

    const isOpenStates = useMemo((): ToggleStateIsOpen<K> => {
        const obj: any = {};
        for (const key in openStates) {
            obj[`isOpen${key.at(0)?.toUpperCase() + key.slice(1)}`] = openStates[key];
        }
        return obj;
    }, [openStates]);

    return { ...isOpenStates, toggle };
}
