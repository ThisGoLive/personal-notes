# Lucene 从一个例子开始

```java
public class LuceneDemo {

    public static void main(String[] args) throws IOException {
        // addData();
        search();
    }

    public  static FSDirectory create() throws IOException {
        // 1 索引文件锁
        LockFactory lockFactory = FSLockFactory.getDefault();
        Path path = new File("./lucene/data").toPath();
        // 执行完成后 如果路径不存在，就会创建空文件夹
        // 2 目录
        return FSDirectory.open(path, lockFactory);
    }

    public static void addData() throws IOException {
        // 创建目录
        try (FSDirectory fsDirectory = create()) {
            // 分词器
            StandardAnalyzer analyzer = new StandardAnalyzer();
            // 3 索引写入配置
            IndexWriterConfig config = new IndexWriterConfig(analyzer);
            // 4 创建 IndexWriter  
            // 文件夹下生成 write.lock
            IndexWriter indexWriter = new IndexWriter(fsDirectory, config);
            List<Document> randomData = ......
            // 5 文件夹下 生成 _0.fdm _0.fdt _0
            indexWriter.addDocuments(randomData);
            // 6 提交
            indexWriter.commit();
            // 生成文件 _1.cfe _1.cfs _1.si segments_1 write.lock
            // 如果多次提交，那么_1.xx不变，会生成_n.xx 
            // segments_1 会变成 segments_n
        }
    }

    private static void search() throws IOException {
        try (FSDirectory fsDirectory = create()) {
            DirectoryReader reader = DirectoryReader.open(fsDirectory);
            IndexSearcher indexSearcher = new IndexSearcher(reader);
            StandardAnalyzer analyzer = new StandardAnalyzer();
            BooleanQuery.setMaxClauseCount(32768);
            QueryBuilder queryBuilder = new QueryBuilder(analyzer);
            Query query = queryBuilder.createBooleanQuery("fullAddress", "号");
            TopDocs topDocs = indexSearcher.search(query, 7);
            System.out.println(topDocs.totalHits);
            for (ScoreDoc scoreDoc : topDocs.scoreDocs) {
                int docID = scoreDoc.doc;
                System.out.print("docID = " + docID);
                float score = scoreDoc.score;
                System.out.print(" score = " + score);
                Document document = indexSearcher.doc(docID);
                System.out.println(" document = " + document);
            }
        }
    }
}
```

1. 第四点执行完成 生成 write.lock

2. addDocuments 执行完成，生成 _0.fdm _0.fdt _0_Lucene90FieldsIndex-doc_ids_0.tmp _0_Lucene90FieldsIndexfile_pointers_1.tmp

3. 提交执行完成：_0.cfe _0.cfs _0.si segments_1 ，并删除了2 中删除的文件

4. 后续 再执行 addDocuments , 还是生成 四个文件 _1 xx

5. 再提交后，根据 配置的所以删除策略，进行 删除 前一次索引文件。

6. 所以一次提交生成的 所以文件 与 段文件 是 n 与 n+1
