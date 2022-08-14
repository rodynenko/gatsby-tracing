const { TracerShim } = require('@opentelemetry/shim-opentracing')
const { AlwaysOnSampler, W3CTraceContextPropagator } = require('@opentelemetry/core')
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node')
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base')
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions')
const { Resource } = require('@opentelemetry/resources')
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')

/**
 * Sampler
 * 
 * is responsible for filtering Spans.
 * Here we include all Spans. It is default sampler.
 */
const sampler = new AlwaysOnSampler()

/**
 * Resources
 * 
 * Set custom metadeta/attributes on Spans.
 * Note: if use SDK, it also automatically includes `process` details
 */
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: `gatsby`,
  [SemanticResourceAttributes.SERVICE_VERSION]: `1.0.0`
})

/**
 * Exporter
 */
const exporter = new JaegerExporter({
  endpoint: `http://localhost:14268/api/traces`
})

/**
 * SpanProcessor
 * 
 * Setup how Spans will be sent to Collector through Exporter.
 * There are two basic options:
 *   1. Batching (grouping together in one request)
 *   2. Simple (send one by one)
 */
const spanProcessor = new BatchSpanProcessor(exporter)

/**
 * Context manager
 * 
 * Store and return context value.
 * We will use default empty one.
 */
const contextManager = undefined

/**
 * Propagator
 * 
 * it defines the method of serialize and deserialize context values, and transportation method.
 */
const propagator = new W3CTraceContextPropagator()

/**
 * TraceProvider
 * 
 * combines all configurations together and provides Tracer
 */
const tracerProvider = new NodeTracerProvider({
  sampler,
  resource
})

// Add span processor
tracerProvider.addSpanProcessor(spanProcessor)
// Turn on tracer provider
tracerProvider.register({
  contextManager,
  propagator
})

/**
 * Instrumentation
 * 
 * configurates libraries to provide information in OpenTelementry format
 */
// const { registerInstrumentations } = require('@opentelemetry/instrumentation')
// const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')
// registerInstrumentations({
//   instrumentations: [
//     getNodeAutoInstrumentations(),
//   ],
//   tracerProvider
// })

exports.create = () => {
  // get tracer and pass it to Gatsby through shim
  console.info(`Collect Gatsby build traces`)
  const tracer = tracerProvider.getTracer(`gatsby-tracer`)
  return new TracerShim(tracer)
}

exports.stop = async () => {
  await tracerProvider.shutdown()
  console.info(`Finish Gatsby build traces`)
}
