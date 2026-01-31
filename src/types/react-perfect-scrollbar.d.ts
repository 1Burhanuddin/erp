declare module 'react-perfect-scrollbar' {
    import { Component } from 'react';

    export interface ScrollBarProps {
        component?: string;
        className?: string;
        style?: React.CSSProperties;
        options?: any;
        onScrollY?: (container: HTMLElement) => void;
        onScrollX?: (container: HTMLElement) => void;
        onScrollUp?: (container: HTMLElement) => void;
        onScrollDown?: (container: HTMLElement) => void;
        onScrollLeft?: (container: HTMLElement) => void;
        onScrollRight?: (container: HTMLElement) => void;
        onYReachStart?: (container: HTMLElement) => void;
        onYReachEnd?: (container: HTMLElement) => void;
        onXReachStart?: (container: HTMLElement) => void;
        onXReachEnd?: (container: HTMLElement) => void;
        children?: React.ReactNode;
    }

    export default class PerfectScrollbar extends Component<ScrollBarProps> { }
}
