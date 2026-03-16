# Stage 1: Rust builder
FROM rust:1.82-bookworm AS builder

WORKDIR /build

# Copy workspace files
COPY Cargo.toml rust-toolchain.toml ./
COPY pipeline-common/ pipeline-common/
COPY hla-typer/ hla-typer/
# Create dummy members so workspace resolves
RUN mkdir -p alignment/src && \
    echo 'fn main() {}' > alignment/src/main.rs
COPY alignment/Cargo.toml alignment/Cargo.toml
RUN mkdir -p variant-caller/src && \
    echo 'fn main() {}' > variant-caller/src/main.rs
COPY variant-caller/Cargo.toml variant-caller/Cargo.toml

# Build release binary
RUN cargo build --release --bin hla-typer && \
    cp target/release/hla-typer /usr/local/bin/hla-typer

# Stage 2: Runtime with HLA typing tools
FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
    bzip2 \
    libcurl4 \
    zlib1g \
    liblzma5 \
    libbz2-1.0 \
    python3 \
    python3-pip \
    python3-numpy \
    python3-pandas \
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

# Install OptiType
RUN pip3 install --break-system-packages pyomo pysam && \
    wget -q https://github.com/FRED-2/OptiType/archive/refs/tags/v1.3.5.tar.gz && \
    tar xzf v1.3.5.tar.gz && \
    mv OptiType-1.3.5 /opt/OptiType && \
    rm v1.3.5.tar.gz

# HLA-HD is installed from institutional license — mount or COPY at build time
# ENV HLAHD_DATA_DIR=/opt/hlahd/data
RUN mkdir -p /opt/hlahd/data

# Create scratch directory for working files
RUN mkdir -p /scratch

COPY --from=builder /usr/local/bin/hla-typer /usr/local/bin/hla-typer

ENTRYPOINT ["/usr/local/bin/hla-typer"]
