# Stage 1: Rust builder
FROM rust:1.82-bookworm AS builder

WORKDIR /build

# Copy workspace files
COPY Cargo.toml rust-toolchain.toml ./
COPY pipeline-common/ pipeline-common/
COPY variant-caller/ variant-caller/
# Create dummy alignment so workspace resolves
RUN mkdir -p alignment/src && \
    echo 'fn main() {}' > alignment/src/main.rs
COPY alignment/Cargo.toml alignment/Cargo.toml

# Build release binary
RUN cargo build --release --bin variant-caller && \
    cp target/release/variant-caller /usr/local/bin/variant-caller

# Stage 2: Runtime with bioinformatics tools
FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
    bzip2 \
    python3 \
    perl \
    libcurl4 \
    zlib1g \
    liblzma5 \
    libbz2-1.0 \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install samtools + bcftools v1.20
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc make libncurses5-dev zlib1g-dev libbz2-dev liblzma-dev libcurl4-openssl-dev && \
    wget -q https://github.com/samtools/samtools/releases/download/1.20/samtools-1.20.tar.bz2 && \
    tar xjf samtools-1.20.tar.bz2 && \
    cd samtools-1.20 && ./configure --prefix=/usr/local && make -j$(nproc) && make install && \
    cd / && rm -rf samtools-1.20* && \
    wget -q https://github.com/samtools/bcftools/releases/download/1.20/bcftools-1.20.tar.bz2 && \
    tar xjf bcftools-1.20.tar.bz2 && \
    cd bcftools-1.20 && ./configure --prefix=/usr/local && make -j$(nproc) && make install && \
    cd / && rm -rf bcftools-1.20* && \
    apt-get purge -y gcc make libncurses5-dev zlib1g-dev libbz2-dev liblzma-dev libcurl4-openssl-dev && \
    apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# Install Strelka2 v2.9.10
RUN wget -q https://github.com/Illumina/strelka/releases/download/v2.9.10/strelka-2.9.10.centos6_x86_64.tar.bz2 && \
    tar xjf strelka-2.9.10.centos6_x86_64.tar.bz2 && \
    mv strelka-2.9.10.centos6_x86_64 /opt/strelka && \
    rm strelka-2.9.10.centos6_x86_64.tar.bz2
ENV PATH="/opt/strelka/bin:${PATH}"

# Install JDK 17 for GATK
RUN apt-get update && apt-get install -y --no-install-recommends openjdk-17-jre-headless && \
    rm -rf /var/lib/apt/lists/*

# Install GATK v4.5
RUN wget -q https://github.com/broadinstitute/gatk/releases/download/4.5.0.0/gatk-4.5.0.0.zip && \
    unzip -q gatk-4.5.0.0.zip && \
    mv gatk-4.5.0.0 /opt/gatk && \
    rm gatk-4.5.0.0.zip && \
    ln -s /opt/gatk/gatk /usr/local/bin/gatk

# Install Ensembl VEP v112
RUN apt-get update && apt-get install -y --no-install-recommends \
    cpanminus libdbi-perl libdbd-mysql-perl libarchive-zip-perl \
    libjson-perl libwww-perl && \
    wget -q https://github.com/Ensembl/ensembl-vep/archive/refs/tags/release/112.tar.gz && \
    tar xzf 112.tar.gz && \
    cd ensembl-vep-release-112 && \
    perl INSTALL.pl --AUTO a --NO_HTSLIB --NO_UPDATE --DESTDIR /opt/vep && \
    cd / && rm -rf ensembl-vep-release-112 112.tar.gz && \
    apt-get autoremove -y && rm -rf /var/lib/apt/lists/*
ENV PATH="/opt/vep:${PATH}"
ENV PERL5LIB="/opt/vep:${PERL5LIB}"

# Create scratch directory
RUN mkdir -p /scratch

COPY --from=builder /usr/local/bin/variant-caller /usr/local/bin/variant-caller

ENTRYPOINT ["/usr/local/bin/variant-caller"]
