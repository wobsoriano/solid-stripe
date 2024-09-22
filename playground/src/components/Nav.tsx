import type { Component, JSX } from 'solid-js'

const Nav: Component<{ children?: JSX.Element }> = props => {
  return (
    <div class="drawer lg:drawer-open">
      <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content flex flex-col">
        <div class="w-full navbar bg-base-300">
          <div class="flex-none lg:hidden">
            <label for="my-drawer-3" class="btn btn-square btn-ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="inline-block w-6 h-6 stroke-current"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </label>
          </div>
          <div class="flex-1 px-2 mx-2">Solid Stripe</div>
          <div class="flex-none hidden lg:block">
            <ul class="menu menu-horizontal">
              <li>
                <a href="https://github.com/wobsoriano/solid-stripe" target="_BLANK">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div class="p-4">{props.children}</div>
      </div>
      <div class="drawer-side">
        <label for="my-drawer-3" class="drawer-overlay" />
        <ul class="menu p-4 w-80 h-full bg-base-200">
          {/* <li><A href="/">Home</A></li> */}
          <li>
            <a href="/credit-card">Credit cards</a>
          </li>
          <li>
            <a href="/payment-element">Payment Element</a>
          </li>
          <li>
            <a href="/payment-request">Payment Request</a>
          </li>
          <li>
            <a href="/sepa">SEPA</a>
          </li>
          <li>
            <a href="/ideal">iDEAL</a>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Nav
