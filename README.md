# AppFlow WebView
An extension to the standard Android WebView for integrating webapps with the Typescript AppFlow API

## Demo Application

The DemoApplication contained in this repo shows how to use the `AppFlowWebView` in conjuction with suitable HTML and Javascript.

## Minimum Browser Integration

When using this WebView you are free to choose to integrate with AppFlow however you please. This can be using any web framework you choose.

At a minimum the `appflow.js` script must be included in your pages as shown below.

```
<html>
<head>
    <title>AppFlow WebView</title>
</head>
<body>
    <h1>AppFlow WebView</h1>
    <script src="js/appflow.js"></script>
</body>
</html>

```

Once the script is embedded two global javascript objects will be available for you to use.

`paymentApi` - an implementation of the AppFlow `PaymentApi` object that can be used to obtain basic parameters such as API version and processing service version.

`paymentClient` - an implementation of the AppFlow `PaymentClient` object that cna be used to initiate payments and requests and listen to the responses from AppFlow.

A basic payment could be written as below.

```
    var uuid = ... // each request must have a unique id created by the client. Use your favourite method here e.g. uuid/v4;
    paymentClient.initiatePayment({
        id: uuid,
        flowType: "sale",
        amounts: {
           baseAmount: 1000,
           currency: "GBP"
        }
    }).then((message) => {
        console.log("Payment initiated successfully");
    }).catch((e) => {
        console.log("Failed to initiate payment");
    });

```

In this implementation the `initiatePayment` method will accept a `Payment` object, a plain javascript object containing valid payment data OR a string containing a valid JSON'd payment.

## Building

The main `appflow.js` script can be built from the Typescript source using

```
npm run build
```

This will compile the Typescript sources and then use webpack to assemble a single javascript file that can be directly imnported into any browser or node project.

## Bugs and Feedback
For bugs, feature requests and questions please use GitHub Issues.

## Contributions
Contributions to any of our repos via pull requests are welcome. We follow the git flow branching model.

## LICENSE
Copyright 2019 AEVI International GmbH

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.