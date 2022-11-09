import type { Component } from 'solid-js';
import { onCleanup, onMount } from 'solid-js';
import { useStripeElements } from '../StripeProvider';
import type { StripeElementEventHandler } from '../types';
import { createAndMountStripeElement } from '../utils';

type Props = StripeElementEventHandler<'payment'>

export const PaymentElement: Component<Props> = (props) => {
  let wrapper: HTMLDivElement;
  const elements = useStripeElements()

  onMount(() => {
    const element = createAndMountStripeElement(wrapper, 'payment', elements!, props);

    onCleanup(() => {
      element.unmount();
    });
  });

  return <div ref={wrapper!} />;
};
