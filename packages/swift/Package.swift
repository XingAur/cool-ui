// swift-tools-version: 6.0
import PackageDescription

let package = Package(
  name: "CoolUI",
  platforms: [.iOS(.v26), .macOS(.v26)],
  products: [.library(name: "CoolUI", targets: ["CoolUI"])],
  targets: [
    .target(name: "CoolUI"),
    .testTarget(name: "CoolUITests", dependencies: ["CoolUI"]),
  ]
)
