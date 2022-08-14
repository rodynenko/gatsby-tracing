const api = require('@opentelemetry/api')
const { TracerShim } = require('@opentelemetry/shim-opentracing')
const { AlwaysOnSampler, W3CTraceContextPropagator } = require('@opentelemetry/core')
const { NodeSDK } = require(`@opentelemetry/sdk-node`)
const { Resource } = require(`@opentelemetry/resources`)
const { SemanticResourceAttributes } = require(`@opentelemetry/semantic-conventions`)
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')
// Node intrumentations are off.
// const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')

const exporter = new JaegerExporter({
  endpoint: `http://localhost:14268/api/traces`
})

const sdk = new NodeSDK({
  sampler: new AlwaysOnSampler(),
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: `gatsby`,
    [SemanticResourceAttributes.SERVICE_VERSION]: `1.0.0`
  }),
  traceExporter: exporter,
  textMapPropagator: new W3CTraceContextPropagator()
  // instrumentations: [getNodeAutoInstrumentations()],
})

sdk
  .start()
  .then(() => console.log(`Tracing initialized`))
  .catch(error => console.log(`Error initializing tracing`, error))


exports.create = () => {
  // get tracer and pass it to Gatsby through shim
  console.info(`Collect Gatsby build traces`)
  const tracer = api.trace.getTracer(`gatsby-tracer-sdk`)
  return new TracerShim(tracer)
}

exports.stop = async () => {
  await sdk.shutdown()
  console.info(`Finish Gatsby build traces`)
}