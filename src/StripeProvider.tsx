import { Stripe, StripeElements } from '@stripe/stripe-js';
import { Component, createContext, useContext } from 'solid-js';

export const StripeContext = createContext<{
  stripe: Stripe | null;
  elements: StripeElements | undefined;
}>();

interface Props {
  stripe: Stripe | null;
}

export const StripeProvider: Component<Props> = (props) => {
  const value = {
    stripe: props.stripe,
    elements: props.stripe?.elements(),
  };

  return <StripeContext.Provider value={value}>{props.children}</StripeContext.Provider>;
};

export const useStripe = () => {
  const ctx = useContext(StripeContext);
  return ctx?.stripe;
};

export const useElements = () => {
  const ctx = useContext(StripeContext);
  return ctx?.elements;
};
