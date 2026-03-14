import { useState } from 'react';

export default function useSimpleNavigation(initial = ['Login']) {
  const [stack, setStack] = useState(initial);
  const [params, setParams] = useState({});
  
  const current = stack[stack.length - 1];
  
  return {
    current,
    params: params[current] || {},
    push: (name, routeParams = {}) => {
      setStack(s => [...s, name]);
      setParams(p => ({ ...p, [name]: routeParams }));
    },
    pop: () => setStack(s => (s.length > 1 ? s.slice(0, -1) : s)),
    replace: (name, routeParams = {}) => {
      setStack([name]);
      setParams({ [name]: routeParams });
    },
    resetTo: (name, routeParams = {}) => {
      setStack([name]);
      setParams({ [name]: routeParams });
    },
  };
}
