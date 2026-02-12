import { useState } from 'react';


export default function useSimpleNavigation(initial = ['Login']) {
const [stack, setStack] = useState(initial);
const current = stack[stack.length - 1];
return {
current,
push: (name) => setStack(s => [...s, name]),
pop: () => setStack(s => (s.length > 1 ? s.slice(0, -1) : s)),
replace: (name) => setStack([name]),
resetTo: (name) => setStack([name]),
};
}