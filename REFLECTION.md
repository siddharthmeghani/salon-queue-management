# Half-page Reflection

During the review of the generated sample data, I noticed that the queue already contained tokens through `S-14`, but the token counter was set to `12`. That meant the first new customer could receive a token that was already visible in the sample queue. I corrected the counter so the next token continues after the seeded examples. I also changed the sample phone values to clearly fictional test numbers so the public demo does not encourage using real customer details.

A second improvement was to keep the status transitions in the queue-rules module rather than scattering them across screen components. Reception and Barber View now call the shared functions for Cancel, No-show, Start and Done. I added automated tests for the ten-minute No-show window, rejoining with a new token, valid Start/Done transitions, and a waiting estimate that falls after earlier customers finish. The test suite reports 11 passing tests.

This review reminded me that vibe coding does not remove the need to understand the generated code. A screen can look finished while a token rule or edge case is still wrong. I need to read the requirements, inspect the relevant code, run tests, and verify the app on a phone and across separate devices before calling it complete.

**Before submission:** personalise this reflection to describe the issue you actually noticed while testing your own GitHub/Vercel deployment, and be ready to explain the correction during the lab review.
