# Stage 1: Rust builder
FROM rust:1.82-bookworm AS builder

WORKDIR /build

# Copy workspace files
COPY Cargo.toml rust-toolchain.toml ./
COPY pipeline-common/ pipeline-common/
COPY alignment/ alignment/
# Create dummy variant-caller so workspace resolves
RUN mkdir -p variant-caller/src && \
    echo 'fn main() {}' > variant-caller/src/main.rs
COPY variant-caller/Cargo.toml variant-caller/Cargo.toml

# Build release binary
RUN cargo build --release --bin alignment && \
    cp target/release/alignment /usr/local/bin/alignment

# Stage 2: Runtime with bioinformatics tools
FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
    bzip2 \
    libcurl4 \
    zlib1g \
    liblzma5 \
    libbz2-1.0 \
    && rm -rf /var/lib/apt/lists/*

# Install samtools v1.20
RUN wget -q https://github.com/samtools/samtools/releases/download/1.20/samtools-1.20.tar.bz2 && \
    tar xjf samtools-1.20.tar.bz2 && \
    cd samtools-1.20 && \
    apt-get update && apt-get install -y --no-install-recommends \
    gcc make libncurses5-dev zlib1g-dev libbz2-dev liblzma-dev libcurl4-openssl-dev && \
    ./configure --prefix=/usr/local && make -j$(nproc) && make install && \
    cd / && rm -rf samtools-1.20* && \
    apt-get purge -y gcc make libncurses5-dev zlib1g-dev libbz2-dev liblzma-dev libcurl4-openssl-dev && \
    apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# Install BWA-MEM2 v2.2.1
RUN wget -q https://github.com/bwa-mem2/bwa-mem2/releases/download/v2.2.1/bwa-mem2-2.2.1_x64-linux.tar.bz2 && \
    tar xjf bwa-mem2-2.2.1_x64-linux.tar.bz2 && \
    cp bwa-mem2-2.2.1_x64-linux/bwa-mem2* /usr/local/bin/ && \
    rm -rf bwa-mem2-2.2.1*

# Create scratch directory for working files
RUN mkdir -p /scratch

COPY --from=builder /usr/local/bin/alignment /usr/local/bin/alignment

ENTRYPOINT ["/usr/local/bin/alignment"]
