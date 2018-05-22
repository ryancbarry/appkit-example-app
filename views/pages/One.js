import React from 'react';
import withStore from 'views/shared/withStore';
import { compose, withHandlers, pure } from 'recompose';
import testModel from 'app/models/testModel';
import {
  stateMachine as objectStateMachine,
  toggleSelector,
  counterSelector
} from 'app/models/ObjectExample';
import Store from 'models/Store';
import { hot } from 'react-hot-loader';
import Header from 'views/shared/Header';
import localStorageDriver from 'models/localStorageDriver';
import Navigation from 'views/shared/Navigation';

const { stateMachine, exampleSelector } = testModel;

export const testStore = Store(stateMachine, undefined, 'testStore');
export const objectStore = Store(
  objectStateMachine,
  localStorageDriver,
  'objectStore'
);

/*

The store pipeline:

1. VIEW view control -> view event
2. VIEW view event -> dispatcher
3. MODEL dispatcher -> reducer
4. MODEL reducer -> value
5. VIEW value -> view render
6. VIEW view render

 */

function One({
  context,
  onClick,
  advance,
  objectStore: { toggleValue, counterValue },
  secondInstanceOfCounter,
  toggle,
  incrementCounter
}) {
  return (
    <div>
      <Header title="Page One" />
      <Navigation routerContext={context} />
      <div>
        {advance} <button onClick={onClick}>Click</button>
      </div>
      <div>
        {toggleValue.toString()} <button onClick={toggle}>Toggle</button>
      </div>
      <div>
        {/* 6. view render */}
        {counterValue}
        {/* 1. view control -> view event */}
        <button onClick={incrementCounter}>Bump</button>
        {secondInstanceOfCounter}
      </div>
    </div>
  );
}

export default compose(
  hot(module),
  withStore(testStore, exampleSelector, 'advance'),
  withStore(
    objectStore,
    value => {
      // console.log('> selector: value', value);
      return {
        toggleValue: toggleSelector(value),
        // 5. value -> view render
        counterValue: counterSelector(value)
      };
    },
    'objectStore'
  ),
  withStore(
    objectStore,
    value => counterSelector(value),
    'secondInstanceOfCounter'
  ),
  withHandlers({
    onClick: props => event => {
      testStore.dispatchTest('changed');
    },
    toggle: props => event => {
      objectStore.toggle();
    },
    incrementCounter: props => event => {
      // 2. view event -> dispatcher
      objectStore.incrementCounter();
    }
  }),
  pure
)(One);
