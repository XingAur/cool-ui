// swift-tools-version: 6.2
import PackageDescription

let package = Package(
  name: "CoolUI",
  platforms: [.iOS(.v26), .macOS("26.1")],
  products: [.library(name: "CoolUI", targets: ["CoolUI"])],
  targets: [
    .target(name: "CoolUI", path: "packages/swift/Sources/CoolUI"),
    .testTarget(name: "CoolUITests", dependencies: ["CoolUI"], path: "packages/swift/Tests/CoolUITests"),
  ]
)
