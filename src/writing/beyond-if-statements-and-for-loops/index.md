# Beyond If Statements and For Loops
<div class="description">
How pattern matching, type systems, and functional thinking transformed my approach to solving problems.
<span class="date-info"><span class="date">2025-07-27</span></span>
<span class="tags">programming, functional-programming, rust</span>
</div>

## Learned Defaults

Would you believe there is more to writing code than if-statements and for-loops? Revelatory, I know. My programming flow has traditionally consisted of writing nested conditionals, iterating through arrays, wrapping errors in try-catches, and hopefully ending up with a finished product that _works_.

In my intro programming course, we learned basic Java. After arrays, we jumped straight into object-oriented design, data structures, and algorithms. We skipped modern syntax like the Stream API, match expressions, `object instanceof ClassName newVar` (inline type check and declaration), and `var`.[^1] The goal was to teach us OOP---not to write high quality code.

So we wrote code that was verbose, hard to follow, and broke if you looked at it wrong. Functions could do anything, fail mysteriously, or modify state in ways I couldn't trace. It was a labyrinth of side effects I didn't comprehend. Looking back, I was living in what I now call the "sea of objects"[^2]---everything connected, state flowing unpredictably, dependencies knotted together beyond comprehension.

I spent some time this summer studying idiomatic Rust and familiarizing myself with the functional programming paradigm. Now, I can confidently say I can represent many common programming patterns better than before.

What does 'better' mean? I'd argue we find improvement when we discover patterns that represent our work more efficiently, intuitively, or clearly.

[^1]: Thanks [Ben](https://ben.enterprises/) for the list!!

[^2]: This is terminology I learned in _Programming Rust (2021)_ describing the tangled web of mutable references common in object-oriented programming.

## Pattern 1: From If Chains to Pattern Matching

The first major shift happened when I realized most of my if-else chains weren't about control flow so much as they were about destructuring data and handling different shapes. Instead of asking "what should I do in this situation?", I started asking "what shape is my data, and how do I handle each shape?"

Here's an example of what I used to write:

```python
def process_pokemon(pokemon_data):
    if pokemon_data.get('type') == 'dragon':
        if pokemon_data.get('evolution_stage') == 'final':
            return unlock_legendary_moves(pokemon_data)
        else:
            return locked_to_basic_moves(pokemon_data)
    elif pokemon_data.get('type') == 'normal':
        return access_normal_moves(pokemon_data)
    else:
        return fallback_struggle(pokemon_data)

```

With match syntax, this becomes:

```rust
match (pokemon.ptype, pokemon.evolution_stage) {
    (Dragon, Final) => unlock_legendary_moves(pokemon),
    (Dragon, _)     => locked_to_basic_moves(pokemon),
    (Normal, _)     => access_normal_moves(pokemon),
    (_, _)          => fallback_struggle(pokemon),
}

```

I'll admit I was initially drawn to pattern matching because it looked cleaner. What surprised me was how it forced me to think about my data's structure upfront and handle all possible cases. The compiler literally won't let me forget an edge case.

Rust's pattern matching opened my eyes to a pattern I'd been approximating badly in other languages. Once I saw it clearly, I realized it's everywhere---Swift has it, Python 3.10+ added it, and I can even fake it in JavaScript:

```javascript
// approximated in js w/ objects
const moveHandlers = {
  'dragon:final': (pokemon) => unlockLegendaryMoves(pokemon),
  'dragon:basic': (pokemon) => lockedToBasicMoves(pokemon),
  'normal': (pokemon) => accessNormalMoves(pokemon),
};
const key = `${pokemon.type}:${pokemon.evolutionStage}`;
return moveHandlers[key]?.(pokemon) || fallbackStruggle(pokemon);

```

The insight isn't one of superior syntax. Rather, it's realizing that sometimes I am better served thinking about data shapes instead of control flow.

## Pattern 2: The Type System as Design Tool

Match syntax is a clean and effective way to process different data shapes, but it's just one part of the puzzle. Another question is how we represent our data in the first place.

Here's the kind of code I used to write:

```javascript
const questLog = {
  status: 'active',
  questId: 'save-the-village',
  rewards: null,         // should only exist when completed
  failureReason: null,   // should only exist when failed
  currentObjective: 0,   // meaningless when completed or failed
};

```

What I learned was to make illegal states unrepresentable.

Now I design with the type system:

```rust
enum QuestState {
    Available { questId: QuestId, requirements: Vec<Requirement> },
    Active { questId: QuestId, currentObjective: usize, progress: Progress },
    Completed { questId: QuestId, rewards: Vec<Reward>, completedAt: DateTime },
    Failed { questId: QuestId, reason: FailureReason, canRetry: bool },
}

```

Impossible states are now impossible to represent. I literally cannot have a completed quest without rewards or an active quest without progress tracking.

I've realized the value in using the type system to encode business rules, not just data shapes. When illegal states become unrepresentable, entire categories of bugs just disappear.

Rust showed me this principle clearly, but once I understood it, I started seeing opportunities everywhere---TypeScript's discriminated unions, even factory functions in dynamic languages. The principle transcends any particular type system.

## Pattern 3: From For Loops to Transformations

Another way I realized I could clean up my code is by replacing many of my for-loops. I realized most of my for-loops weren't really used for iteration---they executed transformations. I was manually implementing map, filter, and reduce operations when I didn't need to.

My manual approach:

```python
def calculate_raid_damage(party_members):
    total_damage = 0
    for member in party_members:
        if member.is_alive and not member.is_stunned:  # filter
            damage = member.base_damage * member.gear_multiplier  # map
            if member.has_buff('berserk'):
                damage *= 1.5
            total_damage += damage  # reduce
    return total_damage

```

What I learned:

```rust
fn calculate_raid_damage(party: &[PartyMember]) -> f64 {
    party.iter()
        .filter(|member| member.is_alive && !member.is_stunned)
        .map(|member| {
            let damage = member.base_damage * member.gear_multiplier;
            if member.has_buff(BuffType::Berserk) {
                damage * 1.5
            } else {
                damage
            }
        })
        .sum()
}

```

Beyond being fewer lines of code, it's more honest about intent. The chain of operations tells me exactly what's happening: filter active members, calculate their damage with multipliers, sum the results. No hidden state, no mutation, no surprises.

### Zero-Cost Iterators

These iterator chains compile to highly optimized assembly. The compiler transforms them into tight loops with minimal overhead---though "zero-cost" is more aspiration than guarantee. Complex chains can sometimes hit optimization limits. But for most code, you get beautiful, functional patterns that run as fast as manual loops.

## Pattern 4: Error Handling

Error handling was where my old patterns really broke down. I went through a clear evolution that was honestly humbling in retrospect:

### "Exception Hell"

You've definitely been here before. Look familiar?
```python
def brew_coffee(order):
    try:
        beans = grind_beans(order.bean_type)
        try:
            water = heat_water(order.temperature)
            try:
                coffee = brew(beans, water, order.brew_time)
                return coffee
            except BrewError as e:
                log_error(e)
                raise
        except WaterError as e:
            log_error(e)
            raise CoffeeError("Water heating failed") from e
    except GrindError as e:
        log_error(e)
        return None  # Sometimes return None, sometimes raise? Great plan!

```

I tried to get smarter about this by making errors explicit in return types:

### Again, but with Explicit Results

```typescript
type BrewResult =
  | { success: true; coffee: Coffee }
  | { success: false; error: string };

function brewCoffee(order: Order): BrewResult {
  // at least now I know this function can fail
}

```

This was better, but chaining these operations was still awkward. Then I learned Rust.

### The Way of Rust

Learning Rust's `Result<T, E>` and the `?` operator was transformative:

```rust
fn brew_coffee(order: &Order) -> Result<Coffee, CoffeeError> {
    let beans = grind_beans(&order.bean_type)?;     // Stop here if grind fails
    let water = heat_water(order.temperature)?;     // Stop here if heating fails
    let coffee = brew(beans, water, order.brew_time)?; // Stop here if brew fails
    Ok(coffee)
}

```

Each `?` says "if this step fails, stop here and return the error." No hidden control flow, no forgotten error cases. The function signature tells me exactly what can go wrong.

The `?` operator itself is Rust magic, but the pattern---making errors explicit and composable---that's universal. I see it everywhere now: JavaScript Promises, Go's error returns, even optional chaining. The principle is the same: make error cases explicit and composable. Instead of hoping functions won't throw, I design them so they can't hide their failure modes.

## Pattern 5: Ownership

Rust's ownership system completely changed how I think about data relationships. Not just in Rust, but everywhere.

Traditional object-oriented thinking creates a tangled mess where everything points to everything else:

<div style="display: flex; justify-content: center; gap: 40px; margin: 20px 0;"><div style="text-align: center;"><img src="images/sea-of-objects.jpeg" alt="Sea of objects diagram" style="width: 300px;"><div style="font-style: italic; margin-top: 8px;">Sea of Objects (Traditional OOP)</div></div><div style="text-align: center;"><img src="images/tree-of-values.jpeg" alt="Tree of values diagram" style="width: 245px;"><div style="font-style: italic; margin-top: 8px;">Tree of Values (Rust's Ownership)</div></div></div>

Following data flow becomes impossible in the traditional model:

```python
# complex "web" of mutable references
class QuestLog:
    def __init__(self):
        self.quests = []
        self.active_quest = None

class Quest:
    def __init__(self, quest_log):
        self.quest_log = quest_log
        quest_log.quests.append(self)   # quest modifies its container!
        quest_log.active_quest = self   # mutation from constructor!

```

Rust's ownership system enforces a "tree of values" where each piece of data has exactly one owner:

```rust
struct QuestLog {
    quests: Vec<Quest>,
    active_quest_id: Option<QuestId>,  // reference by ID, not pointer
}

struct Quest {
    id: QuestId,
    name: String,
    objectives: Vec<Objective>,  // quest owns its objectives
}

```

Now here's the thing: I can't enforce these ownership rules in Python or JavaScript. But understanding this model transformed how I design systems everywhere.

### The Constraint-Solving Mindset

Everyone talks about "fighting the borrow checker," and yeah, at first it's frustrating:

```rust
// this won't compile:
let mut data = vec![1, 2, 3, 4, 5];
let first = &data[0];     // immutable borrow
data.push(6);             // mutable borrow - ERROR! :(
println!("{}", first);    // use of immutable borrow

```

My first reaction was pure frustration. Why won't the compiler let me do this simple thing?

But then I realized: this code was always dangerous. In C++, `data.push_back(6)` might reallocate the vector, making `first` a dangling pointer. The program might crash, or worse, silently corrupt memory causing undefined behavior. Rust just makes the problem visible at compile time.

This changed how I think about data dependencies everywhere. Now I ask: What owns this data? What can modify it, and when? How can I design this to minimize shared mutable state?

And the whole time, the compiler is showing me problems I didn't even know existed. Hardly the nature of an enemy.

## Pattern 6: Functions That Tell the Truth

I was pleasantly surprised to find that function signatures in Rust are complete contracts:

```rust
// this function promises it won't store the reference
fn process_temporarily(data: &str) -> usize {
    data.len()  // Just calculates length and returns
}

// this admits it might fail
fn parse_number(s: &str) -> Result<i32, ParseIntError> {
    s.parse()  // failure is part of the type, not hidden
}

```

Put another way, I literally can't write a function that does sneaky stuff without declaring it upfront. This is because the type system forces honesty through lifetimes and ownership rules.

I learned to design functions so that reading the signature tells me almost everything about what they do. The Result type forces explicit error handling and makes failure part of the type signature. Comments are hardly necessary anymore---the type system does the documenting.

For me, JavaDoc-style comments became largely unnecessary. Instead of:

```java
/**
 * Parses a string representation of a number
 * @param s the string to parse
 * @return the parsed integer
 * @throws ParseIntError if parsing fails
 */

```

Now I just write:

```rust
fn parse_number(input_string: &str) -> Result<i32, ParseIntError>

```

The signature tells you everything: it takes a string reference, might fail, returns an integer on success, and specifies the exact error type. The function signature has become a complete, compiler-verified contract.

## Pattern 7: Monadic Composition

Monads seemed like academic nonsense until I realized I was already using them everywhere---they're just about chaining operations where each step depends on the previous one's result.

```javascript
// sequential dependency (must be serial)
const processUser = async (id) => {
  const user = await fetchUser(id);
  const profile = await fetchProfile(user.profileId);  // depends on user!
  const settings = await fetchSettings(profile.type);  // depends on profile!
  return combineData(user, profile, settings);
};

```

That async/await chain? That's monadic composition. Each step feeds its result to the next step, which can examine that result and decide what to do. Once Rust taught me to see this pattern, I realized I'd been using monads all along---JavaScript Promises, optional chaining, even error handling.

Error handling:

```rust
fn process_data(input: &str) -> Result<Output, Error> {
    parse_input(input)
        .and_then(|data| validate_data(data))           // only runs if parse succeeded
        .and_then(|valid| transform_data(valid))        // only runs if validation succeeded
        .and_then(|transformed| save_data(transformed)) // only runs if transform succeeded
}

```

Optional values:

```javascript
const getConfig = (user) =>
  getUser(user.id)
    ?.getProfile()       // only if user exists
    ?.getSettings()      // only if profile exists
    ?.getTheme()         // only if settings exist
    ?? defaultTheme;     // fallback (if any step fails)

```

I'd been using this pattern all along without knowing it. Monads aren't an abstract math concept in this setting; they're just a way to chain operations where each step can look at the previous result and decide what to do next.

## Pattern 8: Performance Without Compromise

One of the biggest revelations was that these "high-level" patterns often produce faster code than manual imperative approaches.

```rust
// this functional-style code...
fn process_large_dataset(data: &[f64]) -> f64 {
    data.par_iter()                    // parallel processing
        .filter(|&&x| x > 0.0)         // skip negative values
        .map(|&x| x.sqrt())            // square root transformation
        .map(|x| x * 2.0)              // scale by 2
        .sum()                         // parallel reduction
}

// ...compiles to vectorized assembly that uses SIMD instructions
// and parallel execution across CPU cores

```

I found that modern compilers could optimize my functional patterns better because:

1. No aliasing - immutable data means no pointer aliasing analysis needed
2. Clear data flow - transformations can be vectorized automatically
3. No side effects - aggressive optimization is safe
4. Parallelizable - no shared mutable state means easy parallelization

In my experience, the functional approach often matched or beat my hand-written loops, especially when the compiler could apply auto-vectorization.

### Memory Safety Without Garbage Collection

Rust taught me that the choice between performance and safety is a false dichotomy:

```rust
// rust: safe AND fast
fn process(huge_dataset: &[String]) -> Vec<String> {
    huge_dataset.iter()
        .map(|item| expensive_transform(item))
        .collect()
    // memory safety guaranteed at compile time
    // no GC pauses, no leaks, no undefined behavior
    // performance identical to C++
}

```

By making ownership explicit in the type system, Rust eliminates the runtime overhead of safety checks while maintaining complete memory safety.

This level of performance with guaranteed safety is Rust's superpower. But the broader lesson, that functional patterns don't mean slow code, applies everywhere. Modern JS engines optimize map/filter/reduce chains. Java's Stream API can beat manual loops. The key is understanding what your language's compiler or runtime can optimize.

## Pattern 9: Composition

The final pattern that changed everything was learning to build complex behavior from simple, composable pieces.

Before, I had massive, monolithic functions:

```python
def craft_legendary_weapon(player, materials, recipe):
    # 200+ lines of mixed concerns:
    # - validate materials, check requirements, consume resources
    # - calculate success chance, apply buffs, handle failures, etc.
    pass

```

Then, I tried refactoring to composable pipelines:

```rust
fn craft_legendary_weapon(
    player: &Player,
    materials: Materials,
    recipe: Recipe,
) -> Result<LegendaryWeapon, CraftingError> {
    recipe
        .validate_materials(&materials)?
        .check_player_level(player)?
        .check_crafting_skill(player)?
        .consume_materials(&mut player.inventory)?
        .calculate_success_chance(player.stats)?
        .attempt_craft()?
        .apply_enchantments(player.available_enchants)?
        .finalize()
}

```

I found this better because each function has a clear contract and no side effects. I can test them in isolation, combine them in different ways, and reason about the whole system by understanding the parts.

## The Mindset Shift: From Instructions to Descriptions

All of these patterns point to a fundamental shift in how I think about programming. I've moved from asking "how do I tell the computer what to do step by step?" to "how do I describe what I want in terms of transformations and compositions?" The focus shifted from writing code that merely works to writing code I can reason about, from handling every possible error to designing systems where fewer things can go wrong in the first place.

These patterns reinforce each other:

- Type safety makes refactoring fearless
- Immutability makes parallelization trivial
- Pure functions make testing straightforward
- Explicit error handling makes debugging targeted
- Composition makes complexity manageable
- Ownership makes performance predictable

The result is code that's not just more reliable---it's more maintainable, more performant, and honestly more fun to work with.

## How to Start

Don't try to rewrite everything at once. I started with pattern matching, replaced one complex if-else chain with a lookup table. Then gradually added transformations, explicit error handling, and type-driven design.

The compiler was vexing at first. Like, genuinely maddening. But those moments when things finally clicked---when I understood why the borrow checker was saving me from myself, when I saw how composition could replace complexity---made it worth pushing through.

I started by picking one pattern and using it until it felt natural. For me, the compound effect was what mattered.

## Where This Leads

These patterns changed how I think about code, but honestly, I'm still figuring things out. Half the time I still write crude imperative code when I'm prototyping, then come back and clean it up with these patterns.

The real shift wasn't about mastering any particular technique. It was learning to see programming as a design discipline rather than just instruction-writing. The patterns I've shared aren't rules---they're tools I reach for when the code starts feeling unwieldy.

Some of what I've shown---like the borrow checker and zero-cost abstractions---are Rust's unique gifts. But the mental models they taught me? Those work everywhere. Thinking in transformations, making illegal states unrepresentable, explicit error handling, composition over complexity---these patterns transformed how I write JavaScript, Python, everything.

Pick one pattern that resonates and try it out. You don't need to adopt everything at once. Just gradually shift from "how do I make the computer do this" to "how do I describe what I want clearly."

The rest tends to follow from there.
