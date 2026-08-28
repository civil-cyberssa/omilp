export type SettledResult<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown }

export async function runWithConcurrency<Item, Result>(
  items: readonly Item[],
  concurrency: number,
  task: (item: Item, index: number) => Promise<Result>,
): Promise<Array<SettledResult<Result>>> {
  if (!Number.isInteger(concurrency) || concurrency < 1) {
    throw new RangeError("Concurrency must be a positive integer.")
  }

  const results = new Array<SettledResult<Result>>(items.length)
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      const index = cursor
      cursor += 1
      try {
        results[index] = { status: "fulfilled", value: await task(items[index], index) }
      } catch (reason) {
        results[index] = { status: "rejected", reason }
      }
    }
  }

  const workerCount = Math.min(concurrency, items.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return results
}
