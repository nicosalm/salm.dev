# Beyond Language Wars

Date: 2025-02-15

> I used to be that person who'd rewrite perfectly good code just to use a different language. Turns out the real problems are usually somewhere else entirely.

## How I became the rewrite guy (and why I stopped)

<div class="dialogue">
"Why did you rewrite this?"

I stared at my teammate, buffering, trying to come up with a good answer. I'd just spent several hours porting a perfectly functional piece of code from R to Python, and now someone was asking me to justify it.

"Well, uh... Python is more... standard?"

The silence that followed was deafening.
</div>

So anyways, that's when I realized I might be the problem.

This wasn't the first time. It wasn't even the tenth. I'd spent way too many weekends rewriting "good enough"[^1] code from one language to another. Always had some grand justification, whether it be performance, maintainability, or team consistency. But honestly? Half the time I was just bored and wanted to play with something shiny. Being the "I rewrote everything in X" guy gets old fast, especially when your teammates have to re-learn code that was working fine.

So when I heard someone say "Great, now let's refactor it to Python!" about our R-based prediction model that had just hit 92% accuracy, I recognized the pattern. I used to be that person. That uncomfortable recognition motivated me to put my thoughts to paper.

These days I'm more interested in figuring out what each language actually brings to the table and how to make them work together. That "Why?" question haunts many technical decisions I make now (in a good way).

[^1]: "Good enough" code is often truly good enough. I've learned this the hard way after countless hours rewriting functional systems that nobody asked me to touch.

## The Python standardization pitch

I hear this one a lot: "Just do everything in Python, bro." They usually argue in favor of factors like deployment simplicity, package management, and cloud integration. On the surface, it sounds reasonable. But I've been down this road enough times to know the devil lives in the details.

### Deployment (or: why Python feels easy)

When I first deployed a model to AWS Lambda in Python, I was impressed:

```python
def lambda_handler(event, context):
    model = load_model()
    return {'prediction': float(model.predict(event['data']))}
```

Clean, native support. Five minutes to set up. Light work.

Then I tried the same thing in R:

```r
# Requires Plumber API wrapping
#* @post /predict
function(req) {
  reticulate::use_condaenv("r-api")
  predictions <- model$predict(req$data)
  list(prediction = predictions)
}
```

R's deployment pattern isn't pretty, I'll give you that. But focusing only on deployment simplicity is like buying a car based solely on how easy it is to get out of the parking lot. Sure, it matters, but there's a whole journey ahead.

### Package management (or: why I stopped caring about "clean")

Python's packaging does look cleaner:

```bash
python -m pip install --upgrade pip
pip install -e .  # Install from pyproject.toml

# For production:
pip install .
docker build -t mymodel .
```

Meanwhile in R:

```r
install.packages('renv')
renv::init()
renv::restore()
# Pray your system dependencies align
```

I used to get really frustrated with R's package management. Then I learned to appreciate the broader context and began to correctly juxtapose the two approaches: Python's ecosystem evolved alongside web development, inheriting values of fast iteration, rapid deployment, and the idea of breaking things and fixing them later. R is from the scientific computing world, where "oops, I broke the analysis that took three weeks to run" isn't acceptable.

Neither approach is wrong *per se*. They're just optimized for different kinds of pain!

### Cloud integration (or: why timing matters more than merit)

Python's cloud support wears the crown:

```python
from azureml.core import Workspace, Environment
ws = Workspace.from_config()
model = Model.register(ws, model_path="model.pkl")

from google.cloud import aiplatform
endpoint = aiplatform.Endpoint(endpoint_name=ENDPOINT_NAME)
endpoint.deploy(model=model)
```

That said, Python's edge isn't really a matter of technical superiority. AWS Lambda added Python support in 2015; R didn't get there until 2018. That three-year head start created a flywheel effect: better tools attracted more users, which justified better tools, which attracted more users.

## R grew up when I wasn't looking

To be honest, I wrote R off for a while. "Academic toy," I thought. "Can't scale." Then I had to actually use it for some serious statistical work, and damn if it wasn't more extensible than I first thought.

### Statistical computing is still R's superpower

When I need to do complex statistical analysis, R just makes sense:

```r
m <- lmer(response ~ treatment + (1|subject), data = df) %>%
  emmeans(~treatment) %>%
  pairs() %>%
  adjust("bonferroni")

survey <- svydesign(
  ids = ~PSU,
  strata = ~region,
  weights = ~weight,
  data = clinical_data
) %>% svymean(~outcome)
```

I tried porting similar analyses to Python once. The code grew to three times the size, needed custom statistical implementations, plus validation code to make sure I hadn't made mathematical errors. Healthcare and pharma teams stick with R for good reason: it reduces variability, promoting consistency.

### Performance isn't the disaster I thought

"R is slow," people say. Usually right after writing a for-loop instead of using vectorized operations. It's like judging Python performance based on someone who's never heard of NumPy.

I thought R's C++ integration via [Rcpp](https://rcpp.org/) was pretty cool:

```r
RcppArmadillo::cppFunction('
  NumericVector fastFn(NumericVector x) {
    return x * 2;
  }
')
```

Compared to wrestling with Python's Cython or pybind11, Rcpp needs fewer build steps and less manual memory management. I know it doesn't look *great*, but it gets the job done well. Sometimes it even runs faster.

The real issue isn't that R is inherently slow---it's that people write R like it's C instead of leveraging vectorization. When I play to R's strengths (vectorized operations, optimized BLAS libraries, statistical computing), it's genuinely fast. And when I don't? Well, any language looks bad when I'm fighting against its design.

### The tooling caught up

R tooling has come a long way from the bare-bones curriculum I learned in my statistical programming course. In class it was just base R functions, `tidyverse` and maybe loading a CSV with Madison's water levels, which were surveyed by the university. No fancy project management, no integrated development tools, just the console and some scripts.

Now look at this:

```r
usethis::create_package("mypackage")
devtools::check()
renv::snapshot()
pkgdown::build_site()
```

With [LSP support](https://marketplace.visualstudio.com/items?itemName=Ikuyadeu.r), VS Code's R experience rivals Python's intellisense. GitHub Actions, container tools like [rocker](https://rocker-project.org/), and [radian](https://github.com/randy3k/radian) if I just want to work in the terminal---it's all pretty much there now. The ecosystem is solid.

## It's not R, it's your infrastructure

I used to blame languages for scaling problems. "R can't handle production!" Then I started looking at the actual infrastructure challenges, and realized I was yapping up the wrong tree.

### Container complexity is universal

Both Python and R containers have similar overhead:

```dockerfile
# Python
FROM python:3.9-slim
RUN apt-get update && apt-get install -y libgomp1 cuda-toolkit-12-0

# R
FROM rocker/r-ver:4.1.0
RUN apt-get update && apt-get install -y libxml2-dev cuda-toolkit-12-0
```

Once I need system dependencies for numerical computing, GPUs, and networking libraries, Python's "simple" container strategy gets messy relatively quickly. The complexity was always there; I just wasn't looking hard enough.

### Memory management sucks everywhere

Large datasets, garbage collection overhead, and out-of-memory crashes are problems both languages face. The solutions---streaming, chunking, proper resource allocation---are architectural, not language-specific.

When people blame R for memory issues, they're usually missing the bigger picture. The problem isn't the language, it's trying to load a 10GB dataset into memory on a 8GB machine. No amount of language switching fixes bad architecture.

### Stability vs. innovation

Python's ecosystem moves fast and breaks things. R prioritizes stability with long-lasting APIs and strict CRAN policies. Neither is universally better---Python favors rapid innovation, R favors reproducibility.

I've been frustrated by both approaches at different points in time. Rapid innovation is great until my production model breaks because scikit-learn changed their API. Stability is great until I need a feature that won't exist for another two years. Womp womp.

## What actually works in practice

Netflix does something interesting---they balance languages to leverage strengths:

```python
from fastapi import FastAPI
app = FastAPI()

@app.post("/predict")
async def predict(data: dict):
    predictions = r.source("recommendation_core.R")
    return {"recommendations": predictions.get_top_n(data)}
```

Their data scientists use R for statistical work; Python handles web services. It's pragmatic "polyglot architecture" instead of shoehorning everything into one language.

By contrast, healthcare teams often go R-only for regulatory/accountability reasons:

```r
survfit(Surv(time, status) ~ treatment + strata(risk_level), data = trial_data) %>%
  ggsurvplot(risk.table = TRUE, conf.int = TRUE, break.time.by = 90) %>%
  export_validation()
```

R's built-in statistical rigor and regulatory track record make it the obvious choice.

## What I learned about boundaries

Modern teams I have worked with (or have friends on) have mostly moved away from rewrites toward polyglot architectures[^2]. We recognize natural boundaries:

```python
@app.post("/api/v1/predict")
def predict():
    predictions = r.source("model.R").predict(request.json)
    return jsonify({"results": predictions})
```

Python handles web traffic; R handles statistics. What takes 5 lines in R might need 50+ in Python with extra dependencies[^3].

```r
fit <- brm(score ~ treatment + (1|subject), family = gaussian(), data = trials) %>%
  emmeans(~treatment) %>%
  gather_emmeans_draws() %>%
  ggplot(aes(x = contrast, y = .value)) +
  stat_halfeye()
```

Go handles the performance-critical services, Python the web layer, R the statistics. Single containers running dual runtimes work fine. The deployment complexity I was so worried about? Solved with better infrastructure, not language dogma.

## The rewrite conversation

When someone suggests rewriting working code, I ask what problem we're actually solving. Half the time, the answer is "it would be cleaner" or "everyone knows Python." Those are preferences, not problems.

I've learned to build what I need, not what looks good on paper. Define clear boundaries, invest in infrastructure, leverage team expertise, focus on domain needs. Both languages scale when used thoughtfully.

The language wars are mostly about ego anyway. The real work happens in the messy middle where systems need to actually function.

[^2]: Modern microservices architectures commonly use language-specific services communicating via well-defined APIs, rather than forcing a single language standard across the stack.

[^3]: This comparison is based on typical statistical analysis tasks in both languages. R's domain-specific strengths remain significant in statistical computing and regulatory compliance.
