# GoogleApiAutomation

Scripts built on the Node platform.

**Libraries used**

- Test Runner: Mocha
- Test Assertions: chai, should and assert
- SuperAgent driven library for testing HTTP servers

**API**
Google Maps, Directions API

**Api Key**
 AIzaSyDHJRlrMKlzlndqkNjBRv4MDacLS99mYcY

 **To Run Tests**
- Install nodejs
- Install npm
- Download Project
- From command line goto project folder -
- type 'npm install' -
- type 'mocha' to run all the tests under / test folder
- type 'mocha test/file.js' to run individual file

```sh
cd GoogleApiAutomation
npm install
mocha
mocha test/drivingTest.js
```

**Package Structure**
    GoogleApiAutomation\ test
    
  --test\ constants.js
  --test\ directionsUtils.js
  --test\ drivingTest.js
  --test\ transitTest.js
  --test\ travelTimeTest.js
    - --test\ waypointsTest.js

**Test Suite Structure**
```sh
describe{(TEST SUITE, function()
it(TEST CASE, function()
{
TEST STEPS,
----
----
ASSERTIONS
});
)}
```
