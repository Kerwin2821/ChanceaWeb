import React from 'react';

const nest = (children: React.ReactNode, component: React.ReactElement) => 
  React.cloneElement(component, {}, children);

export type MultiProviderProps = {
  providers: React.ReactElement[];
  children: React.ReactNode;
};

const AppMultiContext: React.FC<MultiProviderProps> = ({ children, providers }) => {
  if (!Array.isArray(providers) || providers.length === 0) {

    return <>{children}</>;
  }

  return <>{providers.reduceRight(nest, children)}</>;
};

export default React.memo(AppMultiContext);