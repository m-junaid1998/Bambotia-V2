import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";

/** Typed replacement for `useDispatch` — avoids re-declaring `AppDispatch` at call sites. */
export const useAppDispatch: () => AppDispatch = useDispatch;

/** Typed replacement for `useSelector((state: any) => ...)` used throughout the app. */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
