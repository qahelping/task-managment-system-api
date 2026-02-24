/**
 * Type declaration for react/jsx-runtime so that TS/IDE can resolve it
 * when moduleResolution is "bundler" and node_modules resolution differs.
 */
declare module 'react/jsx-runtime' {
  import type * as React from 'react';
  export const Fragment: React.ExoticComponent<{ children?: React.ReactNode }>;
  export function jsx(
    type: React.ElementType,
    props: unknown,
    key?: React.Key
  ): React.ReactElement;
  export function jsxs(
    type: React.ElementType,
    props: unknown,
    key?: React.Key
  ): React.ReactElement;
  export namespace JSX {
    type ElementType = React.JSX.ElementType;
    interface Element extends React.JSX.Element {}
    interface ElementClass extends React.JSX.ElementClass {}
    interface ElementAttributesProperty extends React.JSX.ElementAttributesProperty {}
    interface ElementChildrenAttribute extends React.JSX.ElementChildrenAttribute {}
    type LibraryManagedAttributes = React.JSX.LibraryManagedAttributes;
    interface IntrinsicAttributes extends React.JSX.IntrinsicAttributes {}
    interface IntrinsicClassAttributes<T> extends React.JSX.IntrinsicClassAttributes<T> {}
    interface IntrinsicElements extends React.JSX.IntrinsicElements {}
  }
}
