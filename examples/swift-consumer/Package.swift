// swift-tools-version: 6.2
import PackageDescription

let package = Package(
  name: "CoolUIConsumer",
  platforms: [.macOS(.v26)],
  dependencies: [.package(path: "../..")],
  targets: [.executableTarget(name: "Demo", dependencies: [.product(name: "CoolUI", package: "CoolUI")])]
)
